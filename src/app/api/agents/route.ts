import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateAgentRanking, defaultSkillTags, deriveAgentStats } from '@/lib/agent-ranking'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'most-trusted'
    const skill = searchParams.get('skill')

    const users = await db.user.findMany({
      where: {
        role: { in: ['WORKER', 'AI_AGENT'] },
        ...(skill
          ? {
              agentProfile: {
                skillTags: { contains: skill },
              },
            }
          : {}),
      },
      include: {
        agentProfile: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            amount: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
            verificationResults: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        reputationEvents: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    const agents = users.map((user) => normalizeAgent(user))
    const sorted = sortAgents(agents, filter)

    return NextResponse.json({
      agents: sorted,
      filters: ['most-trusted', 'fastest-delivery', 'most-experienced', 'lowest-risk'],
    })
  } catch (error) {
    console.error('Agent marketplace error:', error)
    return NextResponse.json({ error: 'Failed to load agents' }, { status: 500 })
  }
}

function normalizeAgent(user: any) {
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

  return {
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
  }
}

function sortAgents(agents: any[], filter: string) {
  const sorted = [...agents]
  if (filter === 'fastest-delivery') {
    return sorted.sort((a, b) => a.averageDeliveryHours - b.averageDeliveryHours || b.rankingScore - a.rankingScore)
  }
  if (filter === 'most-experienced') {
    return sorted.sort((a, b) => b.totalTasksCompleted - a.totalTasksCompleted || b.rankingScore - a.rankingScore)
  }
  if (filter === 'lowest-risk') {
    return sorted.sort((a, b) => a.disputeRate - b.disputeRate || b.trustScore - a.trustScore)
  }
  return sorted.sort((a, b) => b.rankingScore - a.rankingScore || b.trustScore - a.trustScore)
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
