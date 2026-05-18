import { Gavel, MessageSquareWarning, Scale, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { disputeQueue } from "@/lib/agent-trust-data"

const timeline = [
  "Worker submitted proof package with CSV and screenshots.",
  "AI verifier scored task 58/100 due to file comparison mismatch.",
  "Client challenged reconciliation output and requested review.",
  "Escrow remains locked until reviewer decision.",
]

export default function DisputesPage() {
  return (
    <AgentTrustShell
      eyebrow="Dispute resolution system"
      title="Escalate uncertain work into a structured review workflow."
      subtitle="Agent Trust keeps funds locked, preserves evidence, explains the AI decision, and helps reviewers resolve payout outcomes fairly."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel>
          <div className="flex items-center gap-3">
            <Gavel className="h-8 w-8 text-emerald-300" />
            <h2 className="text-2xl font-black">Open dispute</h2>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Task</p>
              <p className="mt-1 font-bold">AT-2024 AI agent invoice reconciliation</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-500">Escrow status</p>
              <p className="mt-1 font-bold text-amber-200">Locked / USD 480</p>
            </div>
            <Textarea
              placeholder="Explain what is disputed and attach the missing evidence checklist."
              className="min-h-32 border-white/10 bg-white/5 text-white"
            />
            <Button className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">Submit for review</Button>
          </div>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center gap-3">
            <MessageSquareWarning className="h-8 w-8 text-amber-300" />
            <h2 className="text-2xl font-black">Evidence timeline</h2>
          </div>
          <div className="mt-5 space-y-3">
            {timeline.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-emerald-200">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {disputeQueue.map((dispute) => (
          <GlassPanel key={dispute.id}>
            <div className="flex items-center justify-between gap-3">
              <ShieldAlert className="h-8 w-8 text-amber-300" />
              <Badge className={dispute.priority === "Critical" ? "bg-red-400 text-slate-950" : "bg-amber-300 text-slate-950"}>
                {dispute.priority}
              </Badge>
            </div>
            <h3 className="mt-5 text-xl font-bold">{dispute.task}</h3>
            <p className="mt-2 text-sm text-slate-400">{dispute.reason}</p>
            <div className="mt-5 rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">
              {dispute.id} / {dispute.amount} / {dispute.owner}
            </div>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="mt-6">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-emerald-300" />
          <h2 className="text-2xl font-black">Resolution states</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["Release to worker", "Partial release", "Refund client", "Request new proof"].map((state) => (
            <div key={state} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              {state}
            </div>
          ))}
        </div>
      </GlassPanel>
    </AgentTrustShell>
  )
}
