import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        country: true,
        phone: true,
        organizationName: true,
        trustScore: true,
        kycStatus: true,
        createdAt: true,
        trustScoreRecords: { orderBy: { createdAt: 'desc' }, take: 20 },
        reputationEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
        assignedTasks: {
          select: { id: true, title: true, status: true, amount: true, currency: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        clientTasks: {
          select: { id: true, title: true, status: true, amount: true, currency: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User profile error:', error)
    return NextResponse.json({ error: 'Failed to load user profile' }, { status: 500 })
  }
}
