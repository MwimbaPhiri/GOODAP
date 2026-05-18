"use client"

import { useEffect, useState } from "react"
import { LockKeyhole, Workflow } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

export default function ExecutionsPage() {
  const [summary, setSummary] = useState<any>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    void apiRequest<any>("/api/governance/summary")
      .then(setSummary)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load execution history"))
  }, [])

  return (
    <AgentTrustShell
      eyebrow="Execution history"
      title="Downstream actions only happen after the trust gate."
      subtitle="PASS outputs execute automatically. FAIL and REVIEW outputs are blocked unless a human override is recorded."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricPill label="Executed or overridden" value={String(summary?.counts.executed ?? 0)} />
        <MetricPill label="Blocked" value={String(summary?.counts.blocked ?? 0)} />
        <MetricPill label="Total gate events" value={String(summary?.executions.length ?? 0)} />
      </div>
      <GlassPanel>
        <div className="mb-5 flex items-center gap-3">
          <Workflow className="h-8 w-8 text-emerald-300" />
          <h2 className="text-2xl font-black">Execution gate events</h2>
        </div>
        <div className="space-y-3">
          {summary?.executions.map((execution: any) => (
            <div key={execution.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="h-4 w-4 text-emerald-300" />
                    <h3 className="font-bold">{execution.actionLabel}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{execution.reason}</p>
                  <p className="mt-2 text-xs text-slate-500">{execution.submission?.taskTitle} / {execution.submission?.agentName}</p>
                </div>
                <Badge className={statusClasses(execution.status)}>{execution.status}</Badge>
              </div>
            </div>
          ))}
          {!summary?.executions.length && <p className="text-sm text-slate-500">No execution gate events yet.</p>}
        </div>
      </GlassPanel>
    </AgentTrustShell>
  )
}
