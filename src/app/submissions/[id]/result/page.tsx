"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { AlertTriangle, BrainCircuit, CheckCircle2, LockKeyhole } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [submission, setSubmission] = useState<any>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    void load()
  }, [id])

  async function load() {
    try {
      const result = await apiRequest<{ submission: any }>(`/api/submissions/${id}`)
      setSubmission(result.submission)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load result")
    }
  }

  async function override() {
    try {
      const result = await apiRequest<{ submission: any }>(`/api/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "override",
          actor: "Human reviewer",
          reason: "Manual review accepted residual risk for demo execution.",
        }),
      })
      setSubmission(result.submission)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Override failed")
    }
  }

  const verification = submission?.verification
  const execution = submission?.executions?.[0]

  return (
    <AgentTrustShell
      eyebrow="Verification result"
      title={submission?.taskTitle || "Trust gate result"}
      subtitle="Agent Trust explains why the AI output was allowed, blocked, or routed to human oversight."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}
      {submission && verification && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="flex items-center justify-between">
              <BrainCircuit className="h-10 w-10 text-emerald-300" />
              <Badge className={statusClasses(submission.status)}>{submission.status}</Badge>
            </div>
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-slate-500">Final trust score</p>
            <p className="mt-3 text-6xl font-black">{verification.finalTrustScore}/100</p>
            <Progress value={verification.finalTrustScore} className="mt-5 bg-white/10" />
            <p className="mt-5 text-sm leading-6 text-slate-300">{verification.explanation}</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-emerald-300" />
                <p className="font-bold">Execution gate</p>
              </div>
              <Badge className={`mt-3 ${statusClasses(execution?.status || "BLOCKED")}`}>{execution?.status}</Badge>
              <p className="mt-3 text-sm text-slate-400">{execution?.reason}</p>
            </div>
            {submission.status === "REVIEW" && (
              <Button onClick={override} className="mt-5 w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                Human override execution
              </Button>
            )}
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-2xl font-black">Score breakdown</h2>
            <div className="mt-5 space-y-5">
              <Score label="Completeness" value={verification.completenessScore} />
              <Score label="Relevance" value={verification.relevanceScore} />
              <Score label="Evidence presence" value={verification.evidenceScore} />
              <Score label="Logical coherence" value={verification.coherenceScore} />
              <Score label="Hallucination risk" value={verification.hallucinationRisk} invert />
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center gap-2">
                {verification.flags.length ? <AlertTriangle className="h-5 w-5 text-amber-300" /> : <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                <h3 className="font-bold">Risk indicators</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                {verification.flags.length ? verification.flags.map((flag: string) => <p key={flag}>- {flag}</p>) : <p>No major risk flags.</p>}
              </div>
            </div>
            <Button asChild variant="outline" className="mt-5 border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/audit">View audit trail</Link>
            </Button>
          </GlassPanel>
        </div>
      )}
    </AgentTrustShell>
  )
}

function Score({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className={invert ? "text-amber-200" : "text-emerald-200"}>{value}%</span>
      </div>
      <Progress value={value} className="bg-white/10" />
    </div>
  )
}
