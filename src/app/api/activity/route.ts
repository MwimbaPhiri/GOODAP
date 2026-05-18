import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [activity, disputes, payments] = await Promise.all([
      db.activityLog.findMany({
        include: { user: { select: { name: true, email: true } }, task: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      db.dispute.findMany({
        include: { task: { select: { title: true, amount: true, currency: true } }, openedBy: { select: { name: true } } },
        orderBy: { openedAt: 'desc' },
        take: 20,
      }),
      db.payment.findMany({
        include: { task: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    return NextResponse.json({ activity, disputes, payments })
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 })
  }
}
