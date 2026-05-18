"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, FileText, Gavel, ShieldCheck, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, getStoredUser, statusClasses, type MvpUser } from "@/lib/mvp-client"

type TaskDetail = {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  status: string
  riskLevel: string
  deliverables: string[]
  clientId: string
  assigneeId?: string | null
  client?: { name?: string | null; email: string }
  assignee?: { name?: string | null; email: string; trustScore: number } | null
  escrowAccount?: { status: string; balance: number } | null
  proofSubmissions: {
    id: string
    notes: string
    fileUrls: string[]
    submittedAt: string
    submittedBy: { name?: string | null; email: string }
    verificationResults: VerificationResult[]
  }[]
  verificationResults: VerificationResult[]
  disputes: { id: string; reason: string; priority: string; status: string; openedAt: string }[]
  payments: { id: string; type: string; status: string; amount: number; currency: string; createdAt: string }[]
  activityLogs: { id: string; action: string; createdAt: string }[]
}

type VerificationResult = {
  id: string
  score: number
  decision: string
  explanation: string
  signals: { name: string; score: number; explanation: string }[]
  fraudFlags: string[]
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<MvpUser | null>(null)
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
    void loadTask()
  }, [id])

  async function loadTask() {
    setLoading(true)
    try {
      const result = await apiRequest<{ task: TaskDetail }>(`/api/tasks/${id}`)
      setTask(result.task)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load task")
    } finally {
      setLoading(false)
    }
  }

  async function action(actionName: "accept" | "approve" | "dispute") {
    if (!user) {
      setMessage("Please login first.")
      return
    }

    try {
      const result = await apiRequest<{ task: TaskDetail }>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: actionName,
          userId: user.id,
          reason: "Client requested dispute after reviewing verification result.",
        }),
      })
      setTask(result.task)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed")
    }
  }

  const latestResult = task?.verificationResults?.[0]
  const canAccept = user && user.role !== "CLIENT" && task && !task.assigneeId
  const canSubmit = user && task && task.assigneeId === user.id && ["IN_PROGRESS", "REJECTED", "DISPUTED"].includes(task.status)
  const canApproveOrDispute = user && task && user.id === task.clientId && ["APPROVED", "REJECTED", "DISPUTED"].includes(task.status)

  return (
    <AgentTrustShell
      eyebrow="Task detail"
      title={task?.title || "Loading task..."}
      subtitle={task?.description || "Open a task to accept work, submit proof, inspect verification, release escrow, or raise a dispute."}
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      {loading && <GlassPanel>Loading task...</GlassPanel>}

      {task && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <GlassPanel>
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
              <p className="mt-4 text-sm text-slate-400">Status</p>
              <Badge className={`mt-2 ${statusClasses(task.status)}`}>{task.status.replace("_", " ")}</Badge>
            </GlassPanel>
            <GlassPanel>
              <FileText className="h-7 w-7 text-cyan-300" />
              <p className="mt-4 text-sm text-slate-400">Escrow</p>
              <p className="mt-2 text-2xl font-black">{task.currency} {task.amount.toLocaleString()}</p>
            </GlassPanel>
            <GlassPanel>
              <CheckCircle2 className="h-7 w-7 text-emerald-300" />
              <p className="mt-4 text-sm text-slate-400">Verification</p>
              <p className="mt-2 text-2xl font-black">{latestResult ? `${latestResult.score}/100` : "Not submitted"}</p>
            </GlassPanel>
            <GlassPanel>
              <AlertTriangle className="h-7 w-7 text-amber-300" />
              <p className="mt-4 text-sm text-slate-400">Risk</p>
              <p className="mt-2 text-2xl font-black">{task.riskLevel}</p>
            </GlassPanel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <GlassPanel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Work brief</h2>
                  <p className="mt-2 text-sm text-slate-400">Client: {task.client?.name || task.client?.email}</p>
                  <p className="text-sm text-slate-400">Worker: {task.assignee?.name || task.assignee?.email || "Not accepted yet"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canAccept && <Button onClick={() => action("accept")} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">Accept task</Button>}
                  {canSubmit && (
                    <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                      <Link href={`/tasks/${task.id}/submit`}><Upload className="mr-2 h-4 w-4" /> Submit proof</Link>
                    </Button>
                  )}
                  {latestResult && (
                    <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                      <Link href={`/tasks/${task.id}/result`}>View result</Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-white">Deliverables</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.deliverables.map((item) => (
                    <Badge key={item} className="border border-white/10 bg-white/5 text-slate-200">{item}</Badge>
                  ))}
                </div>
              </div>

              {latestResult && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Latest verification score</span>
                    <span className="text-emerald-200">{latestResult.score}%</span>
                  </div>
                  <Progress value={latestResult.score} className="bg-white/10" />
                  <p className="mt-3 text-sm leading-6 text-slate-300">{latestResult.explanation}</p>
                </div>
              )}

              {canApproveOrDispute && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={() => action("approve")} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                    Approve and release escrow
                  </Button>
                  <Button onClick={() => action("dispute")} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                    <Gavel className="mr-2 h-4 w-4" /> Dispute
                  </Button>
                </div>
              )}
            </GlassPanel>

            <div className="space-y-6">
              <GlassPanel>
                <h2 className="text-2xl font-black">Submissions</h2>
                <div className="mt-4 space-y-3">
                  {task.proofSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-2xl bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">{submission.submittedBy.name || submission.submittedBy.email}</p>
                      <p className="mt-2 text-sm text-slate-300">{submission.notes}</p>
                      <p className="mt-2 text-xs text-slate-500">{submission.fileUrls.length} simulated file(s)</p>
                    </div>
                  ))}
                  {!task.proofSubmissions.length && <p className="text-sm text-slate-500">No proof submitted yet.</p>}
                </div>
              </GlassPanel>

              <GlassPanel>
                <h2 className="text-2xl font-black">Audit trail</h2>
                <div className="mt-4 space-y-3">
                  {task.activityLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">
                      {log.action.replaceAll("_", " ")}
                    </div>
                  ))}
                  {!task.activityLogs.length && <p className="text-sm text-slate-500">No activity yet.</p>}
                </div>
              </GlassPanel>
            </div>
          </div>
        </>
      )}
    </AgentTrustShell>
  )
}
