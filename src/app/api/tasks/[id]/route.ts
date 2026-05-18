import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityUtils } from '@/lib/security'

type RouteContext = {
  params: Promise<{ id: string }>
}

const includeTask = {
  client: { select: { id: true, name: true, email: true, trustScore: true, role: true } },
  assignee: { select: { id: true, name: true, email: true, trustScore: true, role: true } },
  milestones: true,
  escrowAccount: { include: { transactions: { orderBy: { createdAt: 'desc' as const } } } },
  proofSubmissions: {
    include: {
      submittedBy: { select: { id: true, name: true, email: true, trustScore: true } },
      verificationResults: { orderBy: { createdAt: 'desc' as const } },
    },
    orderBy: { submittedAt: 'desc' as const },
  },
  verificationResults: { orderBy: { createdAt: 'desc' as const } },
  disputes: { orderBy: { openedAt: 'desc' as const } },
  payments: { orderBy: { createdAt: 'desc' as const } },
  activityLogs: { orderBy: { createdAt: 'desc' as const }, take: 20 },
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const task = await db.task.findUnique({
      where: { id },
      include: includeTask,
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task: normalizeTask(task) })
  } catch (error) {
    console.error('Task detail error:', error)
    return NextResponse.json({ error: 'Failed to load task' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const action = String(body.action || '').toLowerCase()

    const task = await db.task.findUnique({
      where: { id },
      include: { escrowAccount: true, assignee: true },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (action === 'accept') {
      if (!body.userId) {
        return NextResponse.json({ error: 'userId is required to accept a task' }, { status: 400 })
      }

      await db.task.update({
        where: { id },
        data: {
          assigneeId: body.userId,
          status: 'IN_PROGRESS',
        },
      })

      await logTaskAction(body.userId, id, 'ACCEPT_TASK', { previousStatus: task.status })
      return GET(request, { params: Promise.resolve({ id }) })
    }

    if (action === 'approve') {
      if (!task.assigneeId) {
        return NextResponse.json({ error: 'Task has no assigned worker' }, { status: 400 })
      }

      await db.$transaction(async (tx) => {
        await tx.task.update({
          where: { id },
          data: { status: 'RELEASED' },
        })

        if (task.escrowAccount) {
          await tx.escrowAccount.update({
            where: { id: task.escrowAccount.id },
            data: { balance: 0, status: 'RELEASED', releasedAt: new Date() },
          })

          await tx.escrowTransaction.create({
            data: {
              escrowAccountId: task.escrowAccount.id,
              type: 'RELEASE',
              amount: task.amount,
              currency: task.currency,
              status: 'COMPLETED',
              provider: task.paymentRail || 'Agent Trust escrow',
              externalRef: `release-${Date.now().toString(36)}`,
            },
          })
        }

        await tx.payment.create({
          data: {
            taskId: id,
            type: 'RELEASE',
            amount: task.amount,
            currency: task.currency,
            status: 'COMPLETED',
            provider: task.paymentRail || 'Agent Trust escrow',
            reference: `release-${Date.now().toString(36)}`,
          },
        })

        const worker = await tx.user.findUnique({ where: { id: task.assigneeId! }, select: { trustScore: true } })
        const nextScore = Math.min(100, (worker?.trustScore ?? 70) + 6)

        await tx.user.update({
          where: { id: task.assigneeId! },
          data: { trustScore: nextScore },
        })

        await tx.trustScore.create({
          data: {
            userId: task.assigneeId!,
            taskId: id,
            score: nextScore,
            delta: 6,
            reason: 'Client approved verified task and escrow was released.',
          },
        })

        await tx.reputationEvent.create({
          data: {
            userId: task.assigneeId!,
            taskId: id,
            type: 'TASK_APPROVED',
            delta: 6,
            reason: 'Task approved by client',
          },
        })
      })

      await logTaskAction(body.userId || task.clientId, id, 'APPROVE_AND_RELEASE', { amount: task.amount, currency: task.currency })
      return GET(request, { params: Promise.resolve({ id }) })
    }

    if (action === 'dispute') {
      const reason = SecurityUtils.sanitizeInput(body.reason || 'Client disputed verification result')

      await db.$transaction(async (tx) => {
        await tx.task.update({
          where: { id },
          data: { status: 'DISPUTED', riskLevel: 'HIGH' },
        })

        await tx.dispute.create({
          data: {
            taskId: id,
            openedById: body.userId || task.clientId,
            reason,
            evidenceSummary: body.evidenceSummary ? SecurityUtils.sanitizeInput(body.evidenceSummary) : null,
            priority: 'HIGH',
          },
        })
      })

      await logTaskAction(body.userId || task.clientId, id, 'OPEN_DISPUTE', { reason })
      return GET(request, { params: Promise.resolve({ id }) })
    }

    return NextResponse.json({ error: 'Unsupported task action' }, { status: 400 })
  } catch (error) {
    console.error('Task action error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

function normalizeTask(task: any) {
  return {
    ...task,
    deliverables: parseJson(task.deliverables, []),
    proofSubmissions: task.proofSubmissions?.map((submission: any) => ({
      ...submission,
      fileUrls: parseJson(submission.fileUrls, []),
      fileHashes: parseJson(submission.fileHashes, []),
      verificationResults: submission.verificationResults?.map(normalizeVerificationResult) ?? [],
    })) ?? [],
    verificationResults: task.verificationResults?.map(normalizeVerificationResult) ?? [],
  }
}

function normalizeVerificationResult(result: any) {
  return {
    ...result,
    signals: parseJson(result.signals, []),
    fraudFlags: parseJson(result.fraudFlags, []),
  }
}

function parseJson(value: string | null | undefined, fallback: unknown) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function logTaskAction(userId: string, taskId: string, action: string, metadata: Record<string, unknown>) {
  await db.activityLog.create({
    data: {
      userId,
      action,
      entityType: 'TASK',
      entityId: taskId,
      taskId,
      metadata: JSON.stringify(metadata),
    },
  })
}
