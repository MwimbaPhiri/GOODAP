import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyGovernanceSubmission } from '@/lib/governance-verification'

export async function GET() {
  try {
    const submissions = await db.governanceSubmission.findMany({
      include: {
        verification: true,
        executions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ submissions: submissions.map(normalizeSubmission) })
  } catch (error) {
    console.error('Governance submissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to load AI output submissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const requirements = normalizeList(body.taskRequirements)
    const evidenceFiles = normalizeList(body.evidenceFiles)

    if (!body.agentName || !body.taskTitle || !body.outputText || !body.explanation || !requirements.length) {
      return NextResponse.json(
        { error: 'agentName, taskTitle, taskRequirements, outputText, and explanation are required' },
        { status: 400 },
      )
    }

    const verification = verifyGovernanceSubmission({
      taskRequirements: requirements,
      outputText: String(body.outputText),
      explanation: String(body.explanation),
      evidenceFiles,
      riskContext: body.riskContext ? String(body.riskContext) : null,
    })

    const submission = await db.$transaction(async (tx) => {
      const created = await tx.governanceSubmission.create({
        data: {
          agentName: String(body.agentName).slice(0, 140),
          agentType: String(body.agentType || 'autonomous_agent').slice(0, 80),
          taskTitle: String(body.taskTitle).slice(0, 180),
          taskRequirements: JSON.stringify(requirements),
          outputText: String(body.outputText),
          explanation: String(body.explanation),
          evidenceFiles: JSON.stringify(evidenceFiles),
          riskContext: body.riskContext ? String(body.riskContext) : null,
          status: verification.decision,
          verification: {
            create: {
              completenessScore: verification.completenessScore,
              relevanceScore: verification.relevanceScore,
              evidenceScore: verification.evidenceScore,
              coherenceScore: verification.coherenceScore,
              hallucinationRisk: verification.hallucinationRisk,
              finalTrustScore: verification.finalTrustScore,
              decision: verification.decision,
              explanation: verification.explanation,
              flags: JSON.stringify(verification.flags),
            },
          },
        },
      })

      const executionStatus = verification.decision === 'PASS' ? 'EXECUTED' : 'BLOCKED'
      await tx.governanceExecution.create({
        data: {
          submissionId: created.id,
          actionLabel: body.actionLabel ? String(body.actionLabel).slice(0, 160) : 'Simulated workflow approval',
          status: executionStatus,
          reason:
            verification.decision === 'PASS'
              ? 'Trust gate passed; simulated downstream execution allowed.'
              : `Trust gate returned ${verification.decision}; downstream execution blocked.`,
        },
      })

      await tx.governanceAudit.createMany({
        data: [
          {
            submissionId: created.id,
            eventType: 'OUTPUT_SUBMITTED',
            actor: created.agentName,
            details: `Agent output submitted for "${created.taskTitle}".`,
          },
          {
            submissionId: created.id,
            eventType: 'VERIFICATION_DECISION',
            actor: 'Agent Trust Verification Engine',
            details: verification.explanation,
          },
          {
            submissionId: created.id,
            eventType: executionStatus === 'EXECUTED' ? 'EXECUTION_ALLOWED' : 'EXECUTION_BLOCKED',
            actor: 'Agent Trust Execution Gate',
            details: executionStatus === 'EXECUTED' ? 'Simulated action was executed.' : 'Simulated action was blocked.',
          },
        ],
      })

      return created
    })

    const fullSubmission = await db.governanceSubmission.findUnique({
      where: { id: submission.id },
      include: { verification: true, executions: { orderBy: { createdAt: 'desc' } }, auditEvents: { orderBy: { createdAt: 'desc' } } },
    })

    return NextResponse.json({ submission: normalizeSubmission(fullSubmission), verification }, { status: 201 })
  } catch (error) {
    console.error('Governance submission error:', error)
    return NextResponse.json({ error: 'Failed to submit AI output' }, { status: 500 })
  }
}

function normalizeSubmission(submission: any) {
  if (!submission) return null
  return {
    ...submission,
    taskRequirements: parseJson(submission.taskRequirements, []),
    evidenceFiles: parseJson(submission.evidenceFiles, []),
    verification: submission.verification
      ? {
          ...submission.verification,
          flags: parseJson(submission.verification.flags, []),
        }
      : null,
  }
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
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
