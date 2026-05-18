export type AgentRankingInput = {
  trustScore: number
  completionRate: number
  disputeRate: number
  averageDeliveryHours: number
  totalTasksCompleted: number
}

export type AgentRankingBreakdown = {
  rankingScore: number
  speedScore: number
  experienceBonus: number
  explanation: string
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export function calculateAgentRanking(agent: AgentRankingInput): AgentRankingBreakdown {
  const speedScore = clamp(100 - Math.min(agent.averageDeliveryHours, 120) * 0.7)
  const experienceBonus = Math.min(agent.totalTasksCompleted * 1.5, 10)
  const lowRiskScore = clamp(100 - agent.disputeRate)

  const rankingScore = clamp(
    agent.trustScore * 0.4 +
      agent.completionRate * 0.25 +
      lowRiskScore * 0.2 +
      speedScore * 0.1 +
      experienceBonus,
  )

  return {
    rankingScore,
    speedScore,
    experienceBonus,
    explanation: `Ranked from trust (${agent.trustScore}), completion (${Math.round(agent.completionRate)}%), low dispute risk (${Math.round(lowRiskScore)}%), speed (${speedScore}), and experience bonus (${experienceBonus.toFixed(1)}).`,
  }
}

export function deriveAgentStats(tasks: Array<{ status: string; createdAt: Date; updatedAt: Date }>) {
  const accepted = tasks.length
  const completed = tasks.filter((task) => task.status === "RELEASED").length
  const failed = tasks.filter((task) => task.status === "REJECTED").length
  const disputed = tasks.filter((task) => task.status === "DISPUTED").length
  const completionRate = accepted ? (completed / accepted) * 100 : 0
  const disputeRate = accepted ? (disputed / accepted) * 100 : 0
  const completedTasks = tasks.filter((task) => task.status === "RELEASED")
  const averageDeliveryHours = completedTasks.length
    ? completedTasks.reduce((sum, task) => sum + Math.max(1, (task.updatedAt.getTime() - task.createdAt.getTime()) / 36e5), 0) /
      completedTasks.length
    : 48

  return {
    accepted,
    completed,
    failed,
    disputed,
    completionRate,
    disputeRate,
    averageDeliveryHours,
  }
}

export function defaultSkillTags(role?: string | null) {
  if (role === "AI_AGENT") return ["analysis", "data entry", "automation", "research"]
  return ["writing", "design", "delivery", "analysis"]
}
