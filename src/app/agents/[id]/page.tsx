"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { Award, BriefcaseBusiness, Clock3, ShieldCheck, Star, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

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
  totalTasksAccepted: number
  totalTasksFailed: number
  totalDisputes: number
  averageDeliveryHours: number
  disputeRate: number
  skillTags: string[]
  recentActivity: string
  rankingExplanation: string
  tasks: { id: string; title: string; status: string; amount: number; currency: string; client?: { name?: string | null; email: string }; verificationResults: { score: number; decision: string }[] }[]
  trustScoreRecords: { id: string; score: number; delta: number; reason: string }[]
  reputationEvents: { id: string; reason: string; delta: number }[]
}

export default function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    void apiRequest<{ agent: Agent }>(`/api/agents/${id}`)
      .then((result) => setAgent(result.agent))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load agent"))
  }, [id])

  return (
    <AgentTrustShell
      eyebrow="Agent profile"
      title={agent?.name || "Loading trusted agent..."}
      subtitle={agent?.headline || "Inspect marketplace ranking, delivery reliability, skill tags, and verified work history."}
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      {agent && (
        <>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <GlassPanel>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400 text-3xl font-black text-slate-950">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">{agent.role.replace("_", " ")}</p>
                  <h2 className="text-3xl font-black">{agent.name}</h2>
                  <p className="text-sm text-slate-500">{agent.country} / {agent.email}</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <MetricPill label="Ranking score" value={`${agent.rankingScore}/100`} />
                <MetricPill label="Trust score" value={`${agent.trustScore}/100`} />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Marketplace rank strength</span>
                  <span className="text-emerald-200">{agent.rankingScore}%</span>
                </div>
                <Progress value={agent.rankingScore} className="bg-white/10" />
              </div>
              <p className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">{agent.rankingExplanation}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {agent.skillTags.map((tag) => (
                  <Badge key={tag} className="bg-emerald-400 text-slate-950">{tag}</Badge>
                ))}
              </div>
              <Button asChild className="mt-6 w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                <Link href={`/tasks/new?agentId=${agent.id}`}>Create task for this agent</Link>
              </Button>
            </GlassPanel>

            <div className="grid gap-4 sm:grid-cols-2">
              <GlassPanel>
                <Award className="h-8 w-8 text-emerald-300" />
                <p className="mt-4 text-sm text-slate-400">Completion rate</p>
                <p className="mt-2 text-3xl font-black">{agent.completionRate}%</p>
              </GlassPanel>
              <GlassPanel>
                <BriefcaseBusiness className="h-8 w-8 text-cyan-300" />
                <p className="mt-4 text-sm text-slate-400">Total completed</p>
                <p className="mt-2 text-3xl font-black">{agent.totalTasksCompleted}</p>
              </GlassPanel>
              <GlassPanel>
                <Clock3 className="h-8 w-8 text-yellow-300" />
                <p className="mt-4 text-sm text-slate-400">Average delivery</p>
                <p className="mt-2 text-3xl font-black">{agent.averageDeliveryHours}h</p>
              </GlassPanel>
              <GlassPanel>
                <TrendingUp className="h-8 w-8 text-emerald-300" />
                <p className="mt-4 text-sm text-slate-400">Dispute rate</p>
                <p className="mt-2 text-3xl font-black">{agent.disputeRate}%</p>
              </GlassPanel>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <GlassPanel>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-300" />
                <h2 className="text-2xl font-black">Verified task history</h2>
              </div>
              <div className="mt-5 space-y-3">
                {agent.tasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="block rounded-3xl border border-white/10 bg-slate-950/70 p-4 transition hover:border-emerald-300/40">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">{task.title}</h3>
                      <Badge className={statusClasses(task.status)}>{task.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{task.currency} {task.amount.toLocaleString()} / Client: {task.client?.name || task.client?.email || "Unknown"}</p>
                    <p className="mt-2 text-sm text-emerald-200">Latest verification: {task.verificationResults?.[0]?.score ?? "N/A"}</p>
                  </Link>
                ))}
                {!agent.tasks.length && <p className="text-sm text-slate-500">No accepted tasks yet.</p>}
              </div>
            </GlassPanel>

            <GlassPanel>
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-300" />
                <h2 className="text-2xl font-black">Recent trust activity</h2>
              </div>
              <div className="mt-5 space-y-3">
                {agent.trustScoreRecords.map((event) => (
                  <div key={event.id} className="rounded-2xl bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-300">{event.reason}</p>
                    <p className="mt-1 text-xs text-slate-500">Score {event.score} ({event.delta >= 0 ? "+" : ""}{event.delta})</p>
                  </div>
                ))}
                {!agent.trustScoreRecords.length && <p className="text-sm text-slate-500">No trust events yet.</p>}
              </div>
            </GlassPanel>
          </div>
        </>
      )}
    </AgentTrustShell>
  )
}
