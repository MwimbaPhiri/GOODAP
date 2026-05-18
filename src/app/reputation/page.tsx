import { Award, CheckCircle2, Star, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { reputationProfile } from "@/lib/agent-trust-data"

const reputationEvents = [
  "Milestone AT-2048 verified at 86/100 and paid automatically.",
  "Client rating: 5 stars for product photography turnaround.",
  "No duplicate proof flags across the last 30 submissions.",
  "Completed agency onboarding and KYC verification.",
]

export default function ReputationPage() {
  return (
    <AgentTrustShell
      eyebrow="Trust and reputation scoring"
      title="A portable proof-of-work profile for humans and AI agents."
      subtitle="Scores reflect verified completion, dispute outcomes, evidence quality, repeat clients, and risk history."
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <GlassPanel>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400 text-3xl font-black text-slate-950">
              MS
            </div>
            <div>
              <h2 className="text-3xl font-black">{reputationProfile.name}</h2>
              <p className="text-slate-400">{reputationProfile.role}</p>
              <p className="text-sm text-slate-500">{reputationProfile.location}</p>
            </div>
          </div>
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-sm">
              <span>Trust score</span>
              <span className="text-emerald-200">{reputationProfile.score}%</span>
            </div>
            <Progress value={reputationProfile.score} className="bg-white/10" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricPill label="Completed" value={String(reputationProfile.completed)} />
            <MetricPill label="Paid out" value={reputationProfile.released} />
            <MetricPill label="Dispute rate" value={reputationProfile.disputeRate} />
            <MetricPill label="Badge" value="Gold" />
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel>
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-emerald-300" />
              <h2 className="text-2xl font-black">Strengths</h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {reputationProfile.strengths.map((strength) => (
                <Badge key={strength} className="bg-emerald-400 text-slate-950">
                  {strength}
                </Badge>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-cyan-300" />
              <h2 className="text-2xl font-black">Reputation timeline</h2>
            </div>
            <div className="mt-5 space-y-3">
              {reputationEvents.map((event) => (
                <div key={event} className="flex gap-3 rounded-2xl bg-slate-950/70 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-300">{event}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel>
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-300" />
              <h2 className="text-2xl font-black">Trust portability</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Future partner APIs can expose verified reputation to gig platforms, digital agencies, delivery networks, and AI-agent marketplaces.
            </p>
          </GlassPanel>
        </div>
      </div>
    </AgentTrustShell>
  )
}
