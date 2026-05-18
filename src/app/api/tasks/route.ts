import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeTasks } from '@/lib/agent-trust-data'
import { SecurityUtils, rateLimiters } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')

    const tasks = await db.task.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(assigneeId && { assigneeId }),
        ...(status && { status: status.toUpperCase() as any }),
      },
      include: {
        client: { select: { id: true, name: true, email: true, trustScore: true } },
        assignee: { select: { id: true, name: true, email: true, trustScore: true, role: true } },
        milestones: true,
        escrowAccount: { include: { transactions: true } },
        verificationResults: { orderBy: { createdAt: 'desc' }, take: 1 },
        disputes: { orderBy: { openedAt: 'desc' }, take: 1 },
        payments: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ tasks: tasks.map((task: any) => ({ ...task, deliverables: parseJson(task.deliverables, []) })) })
  } catch (error) {
    console.error('Task fetch error:', error)
    return NextResponse.json({ tasks: activeTasks, source: 'demo-fallback' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!rateLimiters.tasks(ip)) {
      return NextResponse.json({ error: 'Too many task creation attempts. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const validation = SecurityUtils.validateTaskInput(body)

    if (!validation.isValid) {
      return NextResponse.json({ error: 'Invalid task data', details: validation.errors }, { status: 400 })
    }

    const amount = Number(body.amount)
    const currency = SecurityUtils.sanitizeInput(body.currency || 'ZMW').toUpperCase()
    const releaseThreshold = Number(body.releaseThreshold || 80)
    const deliverables = body.deliverables.map((item: string) => SecurityUtils.sanitizeInput(item)).slice(0, 25)

    const task = await db.task.create({
      data: {
        title: SecurityUtils.sanitizeInput(body.title),
        description: SecurityUtils.sanitizeInput(body.description),
        deliverables: JSON.stringify(deliverables),
        amount,
        currency,
        releaseThreshold,
        riskLevel: SecurityUtils.sanitizeInput(body.riskLevel || 'LOW').toUpperCase(),
        paymentRail: body.paymentRail ? SecurityUtils.sanitizeInput(body.paymentRail) : 'Airtel Money',
        smartContractRef: body.smartContractRef ? SecurityUtils.sanitizeInput(body.smartContractRef) : `sim-${Date.now().toString(36)}`,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        clientId: body.clientId,
        assigneeId: body.assigneeId || null,
        status: body.fundEscrow ? 'ESCROW_FUNDED' : 'DRAFT',
        milestones: {
          create: (body.milestones?.length ? body.milestones : [{ title: 'Verified completion', payoutPercent: 100 }]).map((milestone: any) => ({
            title: SecurityUtils.sanitizeInput(milestone.title),
            description: milestone.description ? SecurityUtils.sanitizeInput(milestone.description) : null,
            payoutPercent: Number(milestone.payoutPercent || 100),
            dueAt: milestone.dueAt ? new Date(milestone.dueAt) : null,
            verificationRules: milestone.verificationRules ? JSON.stringify(milestone.verificationRules) : null,
          })),
        },
        escrowAccount: body.fundEscrow
          ? {
              create: {
                balance: amount,
                currency,
                status: 'FUNDED',
                providerRef: `mobile-money-${Date.now().toString(36)}`,
                contractAddress: body.smartContractRef || `sim-${Date.now().toString(36)}`,
                fundedAt: new Date(),
                transactions: {
                  create: {
                    type: 'FUND',
                    amount,
                    currency,
                    status: 'COMPLETED',
                    provider: body.paymentRail || 'Airtel Money',
                    externalRef: `fund-${Date.now().toString(36)}`,
                  },
                },
              },
            }
          : undefined,
        payments: body.fundEscrow
          ? {
              create: {
                type: 'FUND',
                amount,
                currency,
                status: 'COMPLETED',
                provider: body.paymentRail || 'Airtel Money',
                reference: `fund-${Date.now().toString(36)}`,
                metadata: JSON.stringify({ simulated: true, releaseThreshold }),
              },
            }
          : undefined,
      },
      include: {
        milestones: true,
        escrowAccount: { include: { transactions: true } },
        payments: true,
      },
    })

    await db.activityLog.create({
      data: {
        userId: body.clientId,
        action: 'CREATE_TRUST_TASK',
        entityType: 'TASK',
        entityId: task.id,
        taskId: task.id,
        metadata: JSON.stringify({ amount, currency, releaseThreshold }),
      },
    })

    return NextResponse.json({ message: 'Task created successfully', task }, { status: 201 })
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
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
