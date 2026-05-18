"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ClipboardList, ShieldCheck, WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

type AdminData = {
  activity: { id: string; action: string; createdAt: string; user?: { name?: string | null; email: string }; task?: { title: string } | null }[]
  disputes: { id: string; reason: string; status: string; priority: string; task?: { title: string; amount: number; currency: string }; openedBy?: { name?: string | null } }[]
  payments: { id: string; type: string; status: string; amount: number; currency: string; task?: { title: string } }[]
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData>({ activity: [], disputes: [], payments: [] })
  const [message, setMessage] = useState("")

  useEffect(() => {
    void apiRequest<AdminData>("/api/activity")
      .then(setData)
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load admin data"))
  }, [])

  const grossEscrow = data.payments
    .filter((payment) => payment.type === "FUND")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <AgentTrustShell
      eyebrow="Simple admin panel"
      title="Audit tasks, disputes, payments, and trust decisions."
      subtitle="A lightweight operations dashboard for hackathon demos. It reads the same activity, dispute, and payment records created by the MVP workflow."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricPill label="Funded escrow" value={`ZMW ${grossEscrow.toLocaleString()}`} />
        <MetricPill label="Open disputes" value={String(data.disputes.filter((item) => item.status !== "RESOLVED").length)} />
        <MetricPill label="Payment records" value={String(data.payments.length)} />
        <MetricPill label="Audit events" value={String(data.activity.length)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <GlassPanel>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-300" />
            <h2 className="text-2xl font-black">Dispute queue</h2>
          </div>
          <div className="mt-5 space-y-3">
            {data.disputes.map((dispute) => (
              <div key={dispute.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">{dispute.task?.title || dispute.id}</h3>
                  <Badge className={dispute.priority === "HIGH" || dispute.priority === "CRITICAL" ? "bg-red-400 text-slate-950" : "bg-amber-300 text-slate-950"}>{dispute.priority}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{dispute.reason}</p>
                <p className="mt-2 text-xs text-slate-500">Opened by {dispute.openedBy?.name || "unknown"} / {dispute.status}</p>
              </div>
            ))}
            {!data.disputes.length && <p className="text-sm text-slate-500">No disputes yet.</p>}
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center gap-3">
            <WalletCards className="h-8 w-8 text-emerald-300" />
            <h2 className="text-2xl font-black">Payment ledger</h2>
          </div>
          <div className="mt-5 space-y-3">
            {data.payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{payment.type}</p>
                  <Badge className={statusClasses(payment.status)}>{payment.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{payment.currency} {payment.amount.toLocaleString()} / {payment.task?.title}</p>
              </div>
            ))}
            {!data.payments.length && <p className="text-sm text-slate-500">No payment events yet.</p>}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="mt-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-cyan-300" />
          <h2 className="text-2xl font-black">Activity audit trail</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.activity.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <p className="font-bold">{event.action.replaceAll("_", " ")}</p>
              </div>
              <p className="mt-2 text-sm text-slate-500">{event.user?.name || event.user?.email || "System"} / {event.task?.title || "Account"}</p>
            </div>
          ))}
          {!data.activity.length && <p className="text-sm text-slate-500">No activity yet.</p>}
        </div>
      </GlassPanel>
    </AgentTrustShell>
  )
}
