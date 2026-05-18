import Link from "next/link"
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Globe2,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustHeader, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import {
  apiArchitecture,
  architectureLayers,
  chatMessages,
  featureCards,
  mobileMoneyConcepts,
  pageTiles,
  productStats,
  roadmap,
  schemaOverview,
  trustFlow,
  verificationSignals,
} from "@/lib/agent-trust-data"

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute right-[-12rem] top-40 h-[36rem] w-[36rem] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <AgentTrustHeader />

      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <Badge className="mb-6 w-fit border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-emerald-100 hover:bg-emerald-300/10">
            AI escrow infrastructure for Africa's work economy
          </Badge>
          <h1 className="max-w-5xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Get paid only after work is verified.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Agent Trust is a smart trust layer for freelancers, SMEs, delivery teams, remote workers, and AI agents. It holds payment in escrow, verifies proof with explainable AI, then releases funds when work is truly complete.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Link href="/tasks/new">
                Create escrow task <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/verification">View AI verification</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-4">
            {productStats.map((stat) => (
              <MetricPill key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        <GlassPanel className="relative">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-200">Live trust room</p>
              <h2 className="text-2xl font-black">Lusaka product photo task</h2>
            </div>
            <Badge className="bg-emerald-400 text-slate-950">Escrow funded</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Locked funds</p>
                <CircleDollarSign className="h-5 w-5 text-emerald-300" />
              </div>
              <p className="mt-3 text-4xl font-black">ZMW 7,500</p>
              <p className="mt-2 text-sm text-slate-400">Release policy: score 80+ or reviewer approval.</p>
              <div className="mt-5 rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Smart contract simulation: escrow hash 0x8a91...trust
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">AI completion score</p>
                <Bot className="h-5 w-5 text-cyan-300" />
              </div>
              <p className="mt-3 text-4xl font-black">86/100</p>
              <Progress value={86} className="mt-4 bg-white/10" />
              <p className="mt-3 text-sm text-slate-400">Passed: file coverage, metadata freshness, quality checks.</p>
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
              <MessageCircle className="h-4 w-4 text-emerald-300" />
              WhatsApp-style proof conversation
            </div>
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div key={`${message.sender}-${message.time}`} className="rounded-2xl bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{message.sender}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-200">{message.body}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Core flow</p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">A trust layer from task creation to payout.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {trustFlow.map((step, index) => {
            const Icon = step.icon
            return (
              <GlassPanel key={step.title} className="min-h-full">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="h-7 w-7 text-emerald-300" />
                  <span className="text-sm text-slate-500">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.body}</p>
              </GlassPanel>
            )
          })}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <GlassPanel>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">AI explanation</p>
          <h2 className="mt-3 text-3xl font-black">Why the task passed.</h2>
          <p className="mt-4 text-slate-300">
            The verifier explains the outcome in business language, not black-box confidence. Reviewers can inspect each signal before escrow release.
          </p>
          <div className="mt-6 space-y-4">
            {verificationSignals.map((signal) => (
              <div key={signal.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{signal.label}</span>
                  <span className="text-emerald-200">{signal.value}%</span>
                </div>
                <Progress value={signal.value} className="bg-white/10" />
                <p className="mt-2 text-xs text-slate-500">{signal.detail}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="grid gap-4 sm:grid-cols-2">
          {featureCards.map((feature) => {
            const Icon = feature.icon
            return (
              <GlassPanel key={feature.title}>
                <Icon className="h-7 w-7 text-emerald-300" />
                <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.copy}</p>
              </GlassPanel>
            )
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Pages required</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">Full product surface.</h2>
          </div>
          <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pageTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link key={tile.href} href={tile.href}>
                <GlassPanel className="h-full transition hover:-translate-y-1 hover:border-emerald-300/40">
                  <Icon className="h-7 w-7 text-emerald-300" />
                  <h3 className="mt-4 text-xl font-bold">{tile.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{tile.copy}</p>
                </GlassPanel>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <GlassPanel>
          <Globe2 className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-4 text-2xl font-black">African fintech rails</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Designed for Zambia first, then interoperable with gig platforms across Africa.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {mobileMoneyConcepts.map((rail) => (
              <Badge key={rail} className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                {rail}
              </Badge>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel>
          <Smartphone className="h-8 w-8 text-cyan-300" />
          <h2 className="mt-4 text-2xl font-black">Mobile-first PWA</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Dense dashboard power on desktop, thumb-friendly task rooms and dispute updates on mobile.
          </p>
          <div className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950 p-4">
            <div className="mx-auto h-1 w-16 rounded-full bg-white/20" />
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-emerald-400/15 p-3 text-sm text-emerald-100">Proof uploaded</div>
              <div className="rounded-2xl bg-white/10 p-3 text-sm text-slate-200">AI score: 86. Release recommended.</div>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel>
          <Zap className="h-8 w-8 text-yellow-300" />
          <h2 className="mt-4 text-2xl font-black">Startup-grade roadmap</h2>
          <div className="mt-4 space-y-4">
            {roadmap.map((item) => (
              <div key={item.phase} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-bold text-emerald-200">{item.phase}: {item.focus}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.scope.join(" / ")}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <GlassPanel>
          <div className="mb-5 flex items-center gap-3">
            <ClipboardCheck className="h-7 w-7 text-emerald-300" />
            <h2 className="text-2xl font-black">Database schema</h2>
          </div>
          <div className="space-y-3">
            {schemaOverview.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-slate-950/70 p-3 text-sm leading-6 text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-cyan-300" />
            <h2 className="text-2xl font-black">API architecture</h2>
          </div>
          <div className="space-y-3">
            {apiArchitecture.map((api) => (
              <div key={api.path} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-cyan-400 text-slate-950">{api.method}</Badge>
                  <code className="text-sm text-emerald-200">{api.path}</code>
                </div>
                <p className="mt-2 text-sm text-slate-400">{api.purpose}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GlassPanel>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">Scalable architecture</p>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {architectureLayers.map((layer) => (
              <div key={layer.title} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <h3 className="font-bold text-white">{layer.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  {layer.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </main>
  )
}
