import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const submission = await db.governanceSubmission.findUnique({
      where: { id },
      include: {
        verification: true,
        executions: { orderBy: { createdAt: 'desc' } },
        auditEvents: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    return NextResponse.json({ submission: normalizeSubmission(submission) })
  } catch (error) {
    console.error('Governance submission detail error:', error)
    return NextResponse.json({ error: 'Failed to load submission' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const action = String(body.action || '').toLowerCase()

    const submission = await db.governanceSubmission.findUnique({
      where: { id },
      include: { verification: true },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (action !== 'override') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    if (submission.status !== 'REVIEW') {
      return NextResponse.json({ error: 'Human override is only available for REVIEW decisions' }, { status: 400 })
    }

    await db.$transaction(async (tx) => {
      await tx.governanceExecution.create({
        data: {
          submissionId: id,
          actionLabel: body.actionLabel ? String(body.actionLabel) : 'Human-approved simulated execution',
          status: 'OVERRIDDEN',
          reason: body.reason ? String(body.reason) : 'Human reviewer accepted residual risk after manual inspection.',
          actor: body.actor ? String(body.actor) : 'Human reviewer',
        },
      })

      await tx.governanceAudit.create({
        data: {
          submissionId: id,
          eventType: 'HUMAN_OVERRIDE',
          actor: body.actor ? String(body.actor) : 'Human reviewer',
          details: body.reason ? String(body.reason) : 'Manual override executed from REVIEW queue.',
        },
      })
    })

    return GET(request, { params: Promise.resolve({ id }) })
  } catch (error) {
    console.error('Governance override error:', error)
    return NextResponse.json({ error: 'Failed to process override' }, { status: 500 })
  }
}

function normalizeSubmission(submission: any) {
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

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
