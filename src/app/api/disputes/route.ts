import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { disputeQueue } from '@/lib/agent-trust-data'
import { SecurityUtils, rateLimiters } from '@/lib/security'

export async function GET() {
  try {
    const disputes = await db.dispute.findMany({
      include: {
        task: { select: { id: true, title: true, amount: true, currency: true } },
        openedBy: { select: { id: true, name: true, email: true } },
        assignedReviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ priority: 'desc' }, { openedAt: 'desc' }],
      take: 50,
    })

    return NextResponse.json({ disputes })
  } catch (error) {
    console.error('Dispute fetch error:', error)
    return NextResponse.json({ disputes: disputeQueue, source: 'demo-fallback' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!rateLimiters.disputes(ip)) {
      return NextResponse.json({ error: 'Too many dispute submissions. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()

    if (!body.taskId || !body.openedById || !body.reason) {
      return NextResponse.json({ error: 'taskId, openedById, and reason are required' }, { status: 400 })
    }

    const dispute = await db.dispute.create({
      data: {
        taskId: body.taskId,
        openedById: body.openedById,
        assignedReviewerId: body.assignedReviewerId || null,
        reason: SecurityUtils.sanitizeInput(body.reason),
        evidenceSummary: body.evidenceSummary ? SecurityUtils.sanitizeInput(body.evidenceSummary) : null,
        priority: body.priority ? String(body.priority).toUpperCase() as any : 'MEDIUM',
        status: 'OPEN',
      },
    })

    await db.task.update({
      where: { id: body.taskId },
      data: { status: 'DISPUTED', riskLevel: dispute.priority === 'CRITICAL' || dispute.priority === 'HIGH' ? 'HIGH' : 'MEDIUM' },
    })

    await db.activityLog.create({
      data: {
        userId: body.openedById,
        action: 'OPEN_DISPUTE',
        entityType: 'DISPUTE',
        entityId: dispute.id,
        taskId: body.taskId,
        metadata: JSON.stringify({ reason: dispute.reason, priority: dispute.priority }),
      },
    })

    return NextResponse.json({ dispute }, { status: 201 })
  } catch (error) {
    console.error('Dispute creation error:', error)
    return NextResponse.json({ error: 'Failed to open dispute' }, { status: 500 })
  }
}
