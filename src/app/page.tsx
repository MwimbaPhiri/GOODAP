import Link from "next/link"
import { ArrowRight, BrainCircuit, FileWarning, LockKeyhole, Radar, ShieldCheck, Workflow, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AgentTrustHeader, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"

const principles = [
  "No AI output is trusted by default",
  "All agent results pass through a verification checkpoint",
  "Execution is blocked unless trust score passes the gate",
  "Every decision is explainable and auditable",
]

const checks = [
  { title: "Completeness", copy: "Does the output cover the requested requirements?", icon: ShieldCheck },
  { title: "Relevance", copy: "Does the response stay aligned to the task and evidence?", icon: Radar },
  { title: "Evidence", copy: "Is supporting proof attached before execution?", icon: LockKeyhole },
  { title: "Coherence", copy: "Are contradictions or unsafe claims present?", icon: BrainCircuit },
  { title: "Hallucination risk", copy: "Does the language include uncertainty, fake proof, or unverifiable claims?", icon: FileWarning },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-12rem] top-40 h-[36rem] w-[36rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>
      <AgentTrustHeader />

      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div>
          <Badge className="mb-6 border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-emerald-100 hover:bg-emerald-300/10">
            AI safety infrastructure for autonomous agents
          </Badge>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            A trust gate before AI outputs cause real-world actions.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Agent Trust verifies autonomous AI agent outputs before they trigger payments, workflow approvals, system executions, or operational decisions.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Link href="/submit">Submit AI output <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/dashboard">Open governance console</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <MetricPill label="Execution policy" value="Default deny" detail="AI output must pass first" />
            <MetricPill label="Decision states" value="3" detail="PASS / REVIEW / FAIL" />
            <MetricPill label="Auditability" value="100%" detail="Every gate event is logged" />
          </div>
        </div>

        <GlassPanel>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-200">Verification pipeline</p>
              <h2 className="text-2xl font-black">Agent output gate</h2>
            </div>
            <Workflow className="h-8 w-8 text-emerald-300" />
          </div>
          <div className="space-y-4">
            {["AI output submitted", "Requirements matched", "Evidence checked", "Hallucination risk scored", "Execution allowed or blocked"].map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">{index + 1}</span>
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {principles.map((principle) => (
            <GlassPanel key={principle}>
              <Zap className="h-7 w-7 text-emerald-300" />
              <p className="mt-4 text-lg font-bold">{principle}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">MVP verification engine</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">Structured safety checks before execution.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {checks.map((check) => {
            const Icon = check.icon
            return (
              <GlassPanel key={check.title}>
                <Icon className="h-8 w-8 text-emerald-300" />
                <h3 className="mt-4 text-xl font-bold">{check.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{check.copy}</p>
              </GlassPanel>
            )
          })}
        </div>
      </section>
    </main>
  )
}
