import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"

const milestones = [
  "Brief accepted and escrow funded",
  "Proof package submitted",
  "AI verification score generated",
  "Auto release or dispute review",
]

export default function CreateTaskPage() {
  return (
    <AgentTrustShell
      eyebrow="Task creation and milestone management"
      title="Define the job, lock the money, and make completion measurable."
      subtitle="This form models the core client workflow: deliverables, payment amount, currency, proof rules, release threshold, and reviewer fallback."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Task title</Label>
              <Input id="title" placeholder="Verify 50 product photos for CopperCart" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" placeholder="CopperCart SME" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="worker">Worker or AI agent</Label>
              <Input id="worker" placeholder="Mwamba Studio or Agent ID" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Escrow amount</Label>
              <Input id="amount" placeholder="7500" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="ZMW, USD, KES, NGN, USDC" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                placeholder="50 edited product photos, contact sheet, ZIP archive, SKU filenames, before/after sample"
                className="min-h-28 border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="proof">Required proof</Label>
              <Textarea
                id="proof"
                placeholder="Screenshots, source files, QR scan, delivery photo, invoice, comparison report, public link"
                className="min-h-24 border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Auto-release score</Label>
              <Input id="threshold" placeholder="80" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rail">Payment rail</Label>
              <Input id="rail" placeholder="Airtel Money" className="border-white/10 bg-white/5 text-white" />
            </div>
          </div>
          <Button className="mt-6 w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">Create escrow-backed task</Button>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel>
            <h2 className="text-2xl font-black">Milestone template</h2>
            <div className="mt-5 space-y-3">
              {milestones.map((milestone, index) => (
                <div key={milestone} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{milestone}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel>
            <h2 className="text-2xl font-black">Verification requirements</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Document completion", "Screenshot check", "Text quality", "QR verification", "Fraud scan", "File comparison"].map((item) => (
                <Badge key={item} className="border border-white/10 bg-white/5 text-slate-200">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              The same structure can power freelance jobs, delivery drops, agency milestones, and AI-agent outputs.
            </p>
          </GlassPanel>
        </div>
      </div>
    </AgentTrustShell>
  )
}
