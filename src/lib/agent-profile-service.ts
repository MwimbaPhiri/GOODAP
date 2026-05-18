import { Prisma } from '@prisma/client'
import { calculateAgentRanking, defaultSkillTags, deriveAgentStats } from '@/lib/agent-ranking'

type Tx = Prisma.TransactionClient

export async function ensureAgentProfile(tx: Tx, userId: string, role?: string | null) {
  const existing = await tx.agentProfile.findUnique({ where: { userId } })
  if (existing) return existing

  return tx.agentProfile.create({
    data: {
      userId,
      headline: role === 'AI_AGENT' ? 'AI work agent with verification-ready outputs' : 'Verified Agent Trust worker',
      skillTags: JSON.stringify(defaultSkillTags(role)),
      recentActivity: 'Joined Agent Trust marketplace',
    },
  })
}

export async function refreshAgentProfile(tx: Tx, userId: string, recentActivity?: string) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    include: {
      agentProfile: true,
      assignedTasks: {
        select: {
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!user || !['WORKER', 'AI_AGENT'].includes(user.role)) return null

  const profile = user.agentProfile || (await ensureAgentProfile(tx, userId, user.role))
  const stats = deriveAgentStats(user.assignedTasks)
  const ranking = calculateAgentRanking({
    trustScore: user.trustScore,
    completionRate: stats.completionRate,
    disputeRate: stats.disputeRate,
    averageDeliveryHours: stats.averageDeliveryHours,
    totalTasksCompleted: stats.completed,
  })

  return tx.agentProfile.update({
    where: { id: profile.id },
    data: {
      totalTasksAccepted: stats.accepted,
      totalTasksCompleted: stats.completed,
      totalTasksFailed: stats.failed,
      totalDisputes: stats.disputed,
      completionRate: stats.completionRate,
      disputeRate: stats.disputeRate,
      averageDeliveryHours: stats.averageDeliveryHours,
      reliabilityScore: user.trustScore,
      rankingScore: ranking.rankingScore,
      recentActivity: recentActivity || profile.recentActivity,
      lastActiveAt: new Date(),
    },
  })
}
