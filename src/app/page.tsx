import Link from "next/link";
import {
  ArrowRight, Radar, Brain, Bell, FileText, Swords, Search, ShieldCheck,
  Sparkles, LineChart, Globe, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";

const FEATURES = [
  { icon: Radar, title: "Real-time monitoring", desc: "Track mentions across news and public content the moment they're published, with modular RSS, Google News and web collectors." },
  { icon: Brain, title: "AI sentiment analysis", desc: "Every article is automatically scored for sentiment, risk, topics and named entities with confidence levels." },
  { icon: Sparkles, title: "AI assistant (RAG)", desc: "Ask questions about your coverage and get grounded answers, summaries, press statements and talking points." },
  { icon: Bell, title: "Smart alerts", desc: "Get notified on negative sentiment, keyword spikes, competitor activity and breaking news across channels." },
  { icon: FileText, title: "Executive reports", desc: "Generate rich PDF reports with charts, tables, AI commentary and recommendations in one click." },
  { icon: Swords, title: "Competitor intelligence", desc: "Benchmark share of voice, sentiment and coverage volume against your competitors over time." },
  { icon: Search, title: "Advanced search", desc: "Filter coverage by sentiment, source, author, country, language, topic, risk level and date." },
  { icon: ShieldCheck, title: "Enterprise security", desc: "Role-based access control, audit logs, JWT auth, input validation and rate limiting by default." },
];

const ROLES = ["Administrator", "Organization Manager", "Communications Officer", "Analyst", "Viewer"];

const STEPS = [
  { title: "Define keywords", desc: "Add company names, products, executives, campaigns and industry terms with boolean rules." },
  { title: "Collect & analyze", desc: "The ingestion engine gathers coverage and the AI analyzes sentiment, risk and topics." },
  { title: "Act on insights", desc: "Get alerts, generate reports and ask the AI assistant for communication strategy." },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#roles" className="hover:text-foreground">Roles</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm"><Link href="/dashboard">Open app</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
              <Button asChild size="sm"><Link href="/register">Get started</Link></Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <Badge variant="secondary" className="mb-6 gap-1.5 py-1">
          <Sparkles className="size-3.5 text-primary" /> AI-powered media intelligence
        </Badge>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Know exactly how the world <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">talks about you</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          MediaPulse AI monitors news and public content, analyzes sentiment, detects reputation risks,
          and delivers AI-powered communication insights — all in one enterprise platform.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href={user ? "/dashboard" : "/register"}>Start monitoring <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Live demo</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Demo login: admin@mediapulse.ai · Password123!</p>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 mx-auto mb-20 grid max-w-4xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
        {[
          { value: "12+", label: "Data collectors", icon: Globe },
          { value: "Real-time", label: "Sentiment scoring", icon: LineChart },
          { value: "5", label: "User roles", icon: ShieldCheck },
          { value: "1-click", label: "PDF reports", icon: FileText },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card/50 p-4 text-center backdrop-blur">
            <s.icon className="mx-auto mb-2 size-5 text-primary" />
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything your comms team needs</h2>
          <p className="mt-3 text-muted-foreground">From ingestion to insight, built for scale and easy to extend.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 text-muted-foreground">Three steps from setup to actionable intelligence.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border bg-card p-6">
              <div className="mb-4 grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-8 sm:p-12">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Built for every role</h2>
            <p className="mt-3 text-muted-foreground">Granular role-based access control keeps the right people in the loop.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ROLES.map((r) => (
              <div key={r} className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium">
                <Check className="size-4 text-primary" /> {r}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to take control of your narrative?</h2>
        <p className="mt-4 text-muted-foreground">Set up your workspace in minutes. No credit card required.</p>
        <Button asChild size="lg" className="mt-8 gap-2">
          <Link href={user ? "/dashboard" : "/register"}>Get started free <ArrowRight className="size-4" /></Link>
        </Button>
      </section>

      <footer className="relative z-10 border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MediaPulse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
