"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { AlertTriangle, Bot, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

type TaskResult = {
  id: string
  title: string
  status: string
  amount: number
  currency: string
  verificationResults: {
    id: string
    score: number
    decision: string
    explanation: string
    signals: { name: string; score: number; explanation: string }[]
    fraudFlags: string[]
  }[]
}

export default function VerificationResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [task, setTask] = useState<TaskResult | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    void loadTask()
  }, [id])

  async function loadTask() {
    try {
      const result = await apiRequest<{ task: TaskResult }>(`/api/tasks/${id}`)
      setTask(result.task)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load result")
    }
  }

  const result = task?.verificationResults?.[0]
  const mvpDecision = result?.decision === "APPROVED" ? "PASS" : result?.decision === "REVIEW" ? "NEEDS REVIEW" : result?.decision === "REJECTED" ? "FAIL" : "PENDING"

  return (
    <AgentTrustShell
      eyebrow="Verification result"
      title={task?.title || "Verification result"}
      subtitle="The result explains why proof passed, failed, or needs manual review before escrow release."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      {!result && (
        <GlassPanel>
          <p className="text-slate-300">No verification result yet.</p>
          <Button asChild className="mt-4 bg-emerald-400 text-slate-950 hover:bg-emerald-300">
            <Link href={`/tasks/${id}/submit`}>Submit proof</Link>
          </Button>
        </GlassPanel>
      )}

      {result && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="flex items-center justify-between">
              <Bot className="h-10 w-10 text-emerald-300" />
              <Badge className={statusClasses(mvpDecision)}>{mvpDecision}</Badge>
            </div>
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-slate-500">Trust score</p>
            <p className="mt-3 text-6xl font-black">{result.score}/100</p>
            <Progress value={result.score} className="mt-5 bg-white/10" />
            <p className="mt-5 text-sm leading-6 text-slate-300">{result.explanation}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                <Link href={`/tasks/${id}`}>Back to task</Link>
              </Button>
            </div>
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-2xl font-black">Why this decision happened</h2>
            <div className="mt-5 space-y-5">
              {result.signals.map((signal) => (
                <div key={signal.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{signal.name}</span>
                    <span className="text-emerald-200">{signal.score}%</span>
                  </div>
                  <Progress value={signal.score} className="bg-white/10" />
                  <p className="mt-2 text-xs leading-5 text-slate-500">{signal.explanation}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center gap-2">
                {result.fraudFlags.length ? <AlertTriangle className="h-5 w-5 text-amber-300" /> : <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                <h3 className="font-bold">Fraud indicators</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                {result.fraudFlags.length ? result.fraudFlags.map((flag) => <p key={flag}>- {flag}</p>) : <p>No major fraud flags found.</p>}
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
    </AgentTrustShell>
  )
}
