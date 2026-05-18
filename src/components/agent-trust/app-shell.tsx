import Link from "next/link"
import { ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { appNav } from "@/lib/agent-trust-data"

type AppShellProps = {
  children: React.ReactNode
  eyebrow?: string
  title?: string
  subtitle?: string
}

export function AgentTrustHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 shadow-[0_0_36px_rgba(16,185,129,0.25)]">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">Agent Trust</p>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Verified escrow</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          {appNav.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-slate-200 hover:bg-white/10 hover:text-white sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
            <Link href="/tasks/new">Create task</Link>
          </Button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
        {appNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  )
}

export function AgentTrustShell({ children, eyebrow, title, subtitle }: AppShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-8%] top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-1/3 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <AgentTrustHeader />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(title || subtitle || eyebrow) && (
          <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl sm:p-8">
            {eyebrow && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200">
                <Sparkles className="h-4 w-4" />
                {eyebrow}
              </div>
            )}
            {title && <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>}
            {subtitle && <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{subtitle}</p>}
          </section>
        )}
        {children}
      </div>
    </main>
  )
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

export function MetricPill({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      {detail && <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>}
    </div>
  )
}
