import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityUtils } from '@/lib/security'
import { scoreVerificationEvidence } from '@/lib/trust-scoring'

const decisionToMvpStatus = {
  approved: 'PASS',
  review: 'NEEDS REVIEW',
  rejected: 'FAIL',
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.taskId || !body.submittedById || !body.notes) {
      return NextResponse.json({ error: 'taskId, submittedById, and notes are required' }, { status: 400 })
    }

    const task = await db.task.findUnique({
      where: { id: body.taskId },
      include: { milestones: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const fileNames = normalizeList(body.fileNames)
    const proofTypes = normalizeList(body.proofTypes).length ? normalizeList(body.proofTypes) : ['text', fileNames.length ? 'file' : 'no-file']
    const deliverables = parseJson<string[]>(task.deliverables, [])

    const result = scoreVerificationEvidence({
      taskTitle: task.title,
      deliverables,
      submittedText: body.notes,
      fileNames,
      proofTypes,
      expectedKeywords: normalizeList(body.expectedKeywords),
      submittedAt: new Date().toISOString(),
      dueAt: task.dueAt?.toISOString(),
    })

    const nextStatus = result.decision === 'approved' ? 'APPROVED' : result.decision === 'review' ? 'DISPUTED' : 'REJECTED'

    const submission = await db.$transaction(async (tx) => {
      const createdSubmission = await tx.proofSubmission.create({
        data: {
          taskId: task.id,
          milestoneId: body.milestoneId || task.milestones[0]?.id || null,
          submittedById: body.submittedById,
          type: fileNames.length ? 'DOCUMENT' : 'TEXT',
          notes: SecurityUtils.sanitizeInput(body.notes),
          fileUrls: JSON.stringify(fileNames.map((name) => `simulated-upload://${name}`)),
          fileHashes: JSON.stringify(fileNames.map((name) => `hash-${Buffer.from(name).toString('hex').slice(0, 12)}`)),
          metadata: JSON.stringify({ proofTypes, simulatedUpload: true }),
        },
      })

      await tx.verificationResult.create({
        data: {
          taskId: task.id,
          proofSubmissionId: createdSubmission.id,
          score: result.score,
          decision: result.decision.toUpperCase() as any,
          explanation: result.explanation,
          signals: JSON.stringify(result.signals),
          fraudFlags: JSON.stringify(result.fraudFlags),
          model: result.model,
        },
      })

      await tx.task.update({
        where: { id: task.id },
        data: {
          status: nextStatus as any,
          riskLevel: result.decision === 'rejected' ? 'HIGH' : result.decision === 'review' ? 'MEDIUM' : 'LOW',
        },
      })

      await tx.activityLog.create({
        data: {
          userId: body.submittedById,
          action: 'SUBMIT_PROOF_AND_VERIFY',
          entityType: 'SUBMISSION',
          entityId: createdSubmission.id,
          taskId: task.id,
          metadata: JSON.stringify({ score: result.score, decision: decisionToMvpStatus[result.decision] }),
        },
      })

      return createdSubmission
    })

    return NextResponse.json({
      submission,
      verification: {
        ...result,
        status: decisionToMvpStatus[result.decision],
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 })
  }
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
