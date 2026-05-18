"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Award, Clock3, Filter, ShieldCheck, TrendingUp, UsersRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { apiRequest } from "@/lib/mvp-client"

type Agent = {
  id: string
  name: string
  email: string
  role: string
  country: string
  headline: string
  trustScore: number
  rankingScore: number
  completionRate: number
  totalTasksCompleted: number
  averageDeliveryHours: number
  disputeRate: number
  skillTags: string[]
  recentActivity: string
  rankingExplanation: string
}

const filters = [
  { value: "most-trusted", label: "Most Trusted", icon: ShieldCheck },
  { value: "fastest-delivery", label: "Fastest Delivery", icon: Clock3 },
  { value: "most-experienced", label: "Most Experienced", icon: Award },
  { value: "lowest-risk", label: "Lowest Risk", icon: TrendingUp },
]

export default function AgentsMarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filter, setFilter] = useState("most-trusted")
  const [skill, setSkill] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    void loadAgents()
  }, [filter])

  async function loadAgents(nextSkill = skill) {
    const params = new URLSearchParams({ filter })
    if (nextSkill.trim()) params.set("skill", nextSkill.trim())
    try {
      const result = await apiRequest<{ agents: Agent[] }>(`/api/agents?${params.toString()}`)
      setAgents(result.agents)
      setMessage("")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load agents")
    }
  }

  const summary = useMemo(() => {
    const avgTrust = agents.length ? Math.round(agents.reduce((sum, agent) => sum + agent.trustScore, 0) / agents.length) : 0
    const avgCompletion = agents.length ? Math.round(agents.reduce((sum, agent) => sum + agent.completionRate, 0) / agents.length) : 0
    return { avgTrust, avgCompletion }
  }, [agents])

  return (
    <AgentTrustShell
      eyebrow="Top Trusted Agents marketplace"
      title="Discover high-performing workers and AI agents before you fund escrow."
      subtitle="Agent Trust ranks agents using trust score, completion rate, dispute risk, delivery speed, and verified task history."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricPill label="Listed agents" value={String(agents.length)} />
        <MetricPill label="Average trust" value={`${summary.avgTrust}/100`} />
        <MetricPill label="Average completion" value={`${summary.avgCompletion}%`} />
        <MetricPill label="Ranking filters" value="4" />
      </div>

      <GlassPanel className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  variant={filter === item.value ? "default" : "outline"}
                  className={filter === item.value ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              placeholder="Filter by skill e.g. design"
              className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white"
            />
            <Button onClick={() => loadAgents()} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Filter className="mr-2 h-4 w-4" /> Apply
            </Button>
          </div>
        </div>
      </GlassPanel>

      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      <div className="grid gap-5 lg:grid-cols-3">
        {agents.map((agent, index) => (
          <GlassPanel key={agent.id} className="transition duration-300 hover:-translate-y-1 hover:border-emerald-300/40">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-slate-950">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Rank #{index + 1}</p>
                  <h2 className="text-xl font-black">{agent.name}</h2>
                  <p className="text-xs text-slate-500">{agent.role.replace("_", " ")} / {agent.country}</p>
                </div>
              </div>
              <Badge className="bg-emerald-400 text-slate-950">{agent.rankingScore}</Badge>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">{agent.headline}</p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span>Trust score</span>
                <span className="text-emerald-200">{agent.trustScore}/100</span>
              </div>
              <Progress value={agent.trustScore} className="bg-white/10" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-950/70 p-3">
                <p className="text-slate-500">Completion</p>
                <p className="mt-1 font-black text-white">{agent.completionRate}%</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-3">
                <p className="text-slate-500">Completed</p>
                <p className="mt-1 font-black text-white">{agent.totalTasksCompleted}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-3">
                <p className="text-slate-500">Avg speed</p>
                <p className="mt-1 font-black text-white">{agent.averageDeliveryHours}h</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-3">
                <p className="text-slate-500">Dispute rate</p>
                <p className="mt-1 font-black text-white">{agent.disputeRate}%</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {agent.skillTags.map((tag) => (
                <Badge key={tag} className="border border-white/10 bg-white/5 text-slate-200">{tag}</Badge>
              ))}
            </div>

            <p className="mt-5 rounded-2xl bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">{agent.rankingExplanation}</p>

            <div className="mt-5 flex gap-2">
              <Button asChild className="flex-1 bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                <Link href={`/agents/${agent.id}`}>View profile</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href={`/tasks/new?agentId=${agent.id}`}>Hire</Link>
              </Button>
            </div>
          </GlassPanel>
        ))}

        {!agents.length && (
          <GlassPanel className="lg:col-span-3">
            <UsersRound className="h-8 w-8 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-black">No agents yet</h2>
            <p className="mt-3 text-sm text-slate-400">Register as a worker or AI agent to appear in the marketplace.</p>
          </GlassPanel>
        )}
      </div>
    </AgentTrustShell>
  )
}
