"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Gavel, Scale, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

type Dispute = {
  id: string
  reason: string
  status: string
  priority: string
  evidenceSummary?: string | null
  task?: { id: string; title: string; amount: number; currency: string }
  openedBy?: { name?: string | null; email: string }
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    void apiRequest<{ disputes: Dispute[] }>("/api/disputes")
      .then((result) => setDisputes(result.disputes))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load disputes"))
  }, [])

  return (
    <AgentTrustShell
      eyebrow="Dispute center"
      title="Resolve tasks that failed verification or were challenged by a client."
      subtitle="Disputes are created from task detail pages when a client rejects the verification result. Funds remain locked until review."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      <div className="grid gap-4 lg:grid-cols-3">
        {disputes.map((dispute) => (
          <GlassPanel key={dispute.id}>
            <div className="flex items-center justify-between gap-3">
              <ShieldAlert className="h-8 w-8 text-amber-300" />
              <Badge className={dispute.priority === "HIGH" || dispute.priority === "CRITICAL" ? "bg-red-400 text-slate-950" : "bg-amber-300 text-slate-950"}>
                {dispute.priority}
              </Badge>
            </div>
            <h3 className="mt-5 text-xl font-bold">{dispute.task?.title || dispute.id}</h3>
            <p className="mt-2 text-sm text-slate-400">{dispute.reason}</p>
            <div className="mt-5 rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">
              {dispute.task?.currency} {dispute.task?.amount.toLocaleString()} / opened by {dispute.openedBy?.name || dispute.openedBy?.email || "unknown"}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge className={statusClasses(dispute.status)}>{dispute.status}</Badge>
              {dispute.task && (
                <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link href={`/tasks/${dispute.task.id}`}>Review task</Link>
                </Button>
              )}
            </div>
          </GlassPanel>
        ))}
        {!disputes.length && (
          <GlassPanel className="lg:col-span-3">
            <Gavel className="h-8 w-8 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-black">No open disputes</h2>
            <p className="mt-3 text-sm text-slate-400">Create a task, submit proof, then dispute from the task detail page to see this queue populate.</p>
          </GlassPanel>
        )}
      </div>

      <GlassPanel className="mt-6">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-emerald-300" />
          <h2 className="text-2xl font-black">Review outcomes</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["Release to worker", "Partial release", "Refund client", "Request new proof"].map((state) => (
            <div key={state} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">{state}</div>
          ))}
        </div>
      </GlassPanel>
    </AgentTrustShell>
  )
}
