import { ArrowDownRight, ArrowUpRight, LockKeyhole, WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { mobileMoneyConcepts } from "@/lib/agent-trust-data"

const ledger = [
  { type: "fund", label: "Client funded escrow", amount: "+ ZMW 7,500", rail: "Airtel Money", icon: ArrowDownRight },
  { type: "hold", label: "Funds locked pending AI verification", amount: "ZMW 7,500", rail: "Agent Trust wallet", icon: LockKeyhole },
  { type: "release", label: "Milestone 1 auto-release", amount: "- ZMW 2,500", rail: "Worker wallet", icon: ArrowUpRight },
]

export default function EscrowPage() {
  return (
    <AgentTrustShell
      eyebrow="Escrow and payment simulation"
      title="A fintech ledger for locked, released, refunded, and split payouts."
      subtitle="Agent Trust can simulate mobile money, wallet, bank, card, and smart-contract settlement before live payment integrations are connected."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel>
          <div className="flex items-center justify-between">
            <WalletCards className="h-9 w-9 text-emerald-300" />
            <Badge className="bg-emerald-400 text-slate-950">Funded</Badge>
          </div>
          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-slate-500">Escrow balance</p>
          <p className="mt-3 text-5xl font-black">ZMW 7,500</p>
          <p className="mt-4 text-slate-400">Task AT-2048 / CopperCart product photo completion</p>
          <div className="mt-7 space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Milestone release progress</span>
                <span className="text-emerald-200">33%</span>
              </div>
              <Progress value={33} className="bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">Release funds</Button>
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Open dispute</Button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <h2 className="text-2xl font-black">Escrow ledger</h2>
          <div className="mt-5 space-y-4">
            {ledger.map((entry) => {
              const Icon = entry.icon
              return (
                <div key={entry.label} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
                    <Icon className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{entry.label}</p>
                    <p className="text-sm text-slate-500">{entry.rail}</p>
                  </div>
                  <p className="font-black text-emerald-200">{entry.amount}</p>
                </div>
              )
            })}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {mobileMoneyConcepts.map((rail) => (
          <GlassPanel key={rail}>
            <p className="text-sm text-slate-500">Payment concept</p>
            <h3 className="mt-2 text-2xl font-black">{rail}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Adapter can map deposits, withdrawal intents, webhook confirmations, reversal states, and ledger reconciliation.
            </p>
          </GlassPanel>
        ))}
      </div>
    </AgentTrustShell>
  )
}
