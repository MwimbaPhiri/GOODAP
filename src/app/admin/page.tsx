import { AlertTriangle, CheckCircle2, ShieldCheck, UsersRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { adminKpis, adminRiskIndicators, disputeQueue } from "@/lib/agent-trust-data"

export default function AdminPage() {
  return (
    <AgentTrustShell
      eyebrow="Admin dashboard"
      title="Monitor escrow health, fraud risk, reviewer queues, and platform operations."
      subtitle="The admin surface is designed for trust operations teams handling high-value payments, disputes, compliance reviews, and suspicious proof patterns."
    >
      <div className="grid gap-4 md:grid-cols-4">
        {adminKpis.map((kpi) => (
          <MetricPill key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <GlassPanel>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-300" />
            <h2 className="text-2xl font-black">Risk indicators</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {adminRiskIndicators.map((risk) => {
              const Icon = risk.icon
              return (
                <div key={risk.label} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <Icon className="h-7 w-7 text-emerald-300" />
                  <p className="mt-4 text-sm text-slate-400">{risk.label}</p>
                  <p className="mt-2 text-3xl font-black">{risk.value}</p>
                </div>
              )
            })}
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-300" />
            <h2 className="text-2xl font-black">Reviewer queue</h2>
          </div>
          <div className="mt-5 space-y-3">
            {disputeQueue.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-emerald-200">{item.id}</p>
                    <h3 className="mt-1 font-bold">{item.task}</h3>
                  </div>
                  <Badge className={item.priority === "Critical" ? "bg-red-400 text-slate-950" : "bg-amber-300 text-slate-950"}>
                    {item.priority}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.reason} / {item.amount} / {item.owner}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <GlassPanel>
          <UsersRound className="h-8 w-8 text-cyan-300" />
          <h2 className="mt-4 text-2xl font-black">Trust operations</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Assign reviewers, inspect evidence, and approve payout exceptions.</p>
        </GlassPanel>
        <GlassPanel>
          <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-4 text-2xl font-black">Audit trail</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Every verification, ledger movement, dispute action, and score update is logged.</p>
        </GlassPanel>
        <GlassPanel>
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-4 text-2xl font-black">Compliance exports</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Prepare reports for payment partners, platform clients, and risk teams.</p>
        </GlassPanel>
      </div>
    </AgentTrustShell>
  )
}
