"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, FileSearch, ShieldAlert, Workflow } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

type Summary = {
  counts: { total: number; pass: number; review: number; fail: number; executed: number; blocked: number }
  averageTrustScore: number
  submissions: any[]
  executions: any[]
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    void apiRequest<Summary>("/api/governance/summary")
      .then(setSummary)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load governance dashboard"))
  }, [])

  return (
    <AgentTrustShell
      eyebrow="AI governance console"
      title="Mission control for autonomous agent outputs."
      subtitle="Monitor submissions, trust scores, blocked executions, human review queues, and audit-ready gate decisions."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricPill label="Submissions" value={String(summary?.counts.total ?? 0)} />
        <MetricPill label="Average trust" value={`${summary?.averageTrustScore ?? 0}/100`} />
        <MetricPill label="Executed" value={String(summary?.counts.executed ?? 0)} />
        <MetricPill label="Blocked" value={String(summary?.counts.blocked ?? 0)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassPanel>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">AI output submissions</h2>
              <p className="text-sm text-slate-400">Every result must pass the trust gate before execution.</p>
            </div>
            <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Link href="/submit">Submit output</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {summary?.submissions.map((submission) => (
              <Link key={submission.id} href={`/submissions/${submission.id}/result`} className="block rounded-3xl border border-white/10 bg-slate-950/70 p-5 transition hover:border-emerald-300/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-emerald-200">{submission.agentName}</p>
                    <h3 className="text-xl font-bold">{submission.taskTitle}</h3>
                  </div>
                  <Badge className={statusClasses(submission.status)}>{submission.status}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Progress value={submission.verification?.finalTrustScore ?? 0} className="bg-white/10" />
                  <span className="w-14 text-right text-sm text-emerald-200">{submission.verification?.finalTrustScore ?? 0}%</span>
                </div>
              </Link>
            ))}
            {!summary?.submissions.length && <p className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-slate-500">No submissions yet.</p>}
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-amber-300" />
              <h2 className="text-2xl font-black">Decision mix</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <DecisionRow icon={CheckCircle2} label="PASS" value={summary?.counts.pass ?? 0} className="text-emerald-300" />
              <DecisionRow icon={FileSearch} label="REVIEW" value={summary?.counts.review ?? 0} className="text-amber-300" />
              <DecisionRow icon={AlertTriangle} label="FAIL" value={summary?.counts.fail ?? 0} className="text-red-300" />
            </div>
          </GlassPanel>
          <GlassPanel>
            <div className="flex items-center gap-3">
              <Workflow className="h-8 w-8 text-emerald-300" />
              <h2 className="text-2xl font-black">Execution history</h2>
            </div>
            <div className="mt-5 space-y-3">
              {summary?.executions.slice(0, 6).map((execution) => (
                <div key={execution.id} className="rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">
                  <Badge className={statusClasses(execution.status)}>{execution.status}</Badge>
                  <p className="mt-2">{execution.submission?.taskTitle}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </AgentTrustShell>
  )
}

function DecisionRow({ icon: Icon, label, value, className }: { icon: any; label: string; value: number; className: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${className}`} />
        <span>{label}</span>
      </div>
      <span className="text-2xl font-black">{value}</span>
    </div>
  )
}
