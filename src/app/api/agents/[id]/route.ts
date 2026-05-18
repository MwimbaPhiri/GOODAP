import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateAgentRanking, defaultSkillTags, deriveAgentStats } from '@/lib/agent-ranking'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const user = await db.user.findUnique({
      where: { id },
      include: {
        agentProfile: true,
        assignedTasks: {
          include: {
            client: { select: { name: true, email: true } },
            verificationResults: { orderBy: { createdAt: 'desc' }, take: 1 },
            disputes: { orderBy: { openedAt: 'desc' }, take: 1 },
          },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        },
        trustScoreRecords: { orderBy: { createdAt: 'desc' }, take: 20 },
        reputationEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })

    if (!user || !['WORKER', 'AI_AGENT'].includes(user.role)) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const stats = deriveAgentStats(user.assignedTasks)
    const profile = user.agentProfile
    const skillTags = profile?.skillTags ? parseJson<string[]>(profile.skillTags, defaultSkillTags(user.role)) : defaultSkillTags(user.role)
    const ranking = calculateAgentRanking({
      trustScore: user.trustScore,
      completionRate: profile?.completionRate ?? stats.completionRate,
      disputeRate: profile?.disputeRate ?? stats.disputeRate,
      averageDeliveryHours: profile?.averageDeliveryHours ?? stats.averageDeliveryHours,
      totalTasksCompleted: profile?.totalTasksCompleted ?? stats.completed,
    })

    return NextResponse.json({
      agent: {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        country: user.country || 'Zambia',
        trustScore: user.trustScore,
        headline: profile?.headline || (user.role === 'AI_AGENT' ? 'AI work agent with verification-ready outputs' : 'Verified Agent Trust worker'),
        skillTags,
        totalTasksCompleted: profile?.totalTasksCompleted ?? stats.completed,
        totalTasksAccepted: profile?.totalTasksAccepted ?? stats.accepted,
        totalTasksFailed: profile?.totalTasksFailed ?? stats.failed,
        totalDisputes: profile?.totalDisputes ?? stats.disputed,
        completionRate: Math.round(profile?.completionRate ?? stats.completionRate),
        disputeRate: Math.round(profile?.disputeRate ?? stats.disputeRate),
        averageDeliveryHours: Math.round(profile?.averageDeliveryHours ?? stats.averageDeliveryHours),
        rankingScore: profile?.rankingScore ? Math.round(profile.rankingScore) : ranking.rankingScore,
        rankingExplanation: ranking.explanation,
        recentActivity: profile?.recentActivity || user.reputationEvents?.[0]?.reason || 'Ready for verified escrow work',
        tasks: user.assignedTasks,
        trustScoreRecords: user.trustScoreRecords,
        reputationEvents: user.reputationEvents,
      },
    })
  } catch (error) {
    console.error('Agent profile error:', error)
    return NextResponse.json({ error: 'Failed to load agent profile' }, { status: 500 })
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
