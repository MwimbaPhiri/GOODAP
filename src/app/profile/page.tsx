"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Award, CheckCircle2, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel, MetricPill } from "@/components/agent-trust/app-shell"
import { apiRequest, getStoredUser, type MvpUser } from "@/lib/mvp-client"

type Profile = MvpUser & {
  trustScoreRecords: { id: string; score: number; delta: number; reason: string; createdAt: string }[]
  reputationEvents: { id: string; delta: number; reason: string; createdAt: string }[]
  assignedTasks: { id: string; title: string; status: string }[]
  clientTasks: { id: string; title: string; status: string }[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const user = getStoredUser()
    if (!user) return
    void apiRequest<{ user: Profile }>(`/api/users/${user.id}`)
      .then((result) => setProfile(result.user))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load profile"))
  }, [])

  return (
    <AgentTrustShell
      eyebrow="Profile and trust score"
      title={profile ? profile.name || profile.email : "Your Agent Trust profile"}
      subtitle="A portable reputation profile that changes as verified tasks are approved, disputed, or rejected."
    >
      {!profile && (
        <GlassPanel>
          <p className="text-slate-300">{message || "Login to view your profile."}</p>
          <Button asChild className="mt-4 bg-emerald-400 text-slate-950 hover:bg-emerald-300">
            <Link href="/login">Login</Link>
          </Button>
        </GlassPanel>
      )}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassPanel>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400 text-3xl font-black text-slate-950">
                {(profile.name || profile.email).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-black">{profile.name || profile.email}</h2>
                <p className="text-slate-400">{profile.role.replace("_", " ")}</p>
                <p className="text-sm text-slate-500">{profile.country || "Zambia"}</p>
              </div>
            </div>
            <div className="mt-8">
              <div className="mb-2 flex justify-between text-sm">
                <span>Trust score</span>
                <span className="text-emerald-200">{profile.trustScore}%</span>
              </div>
              <Progress value={profile.trustScore} className="bg-white/10" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MetricPill label="Assigned tasks" value={String(profile.assignedTasks.length)} />
              <MetricPill label="Client tasks" value={String(profile.clientTasks.length)} />
              <MetricPill label="KYC" value={profile.kycStatus || "PENDING"} />
              <MetricPill label="Country" value={profile.country || "ZM"} />
            </div>
          </GlassPanel>

          <div className="space-y-6">
            <GlassPanel>
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-emerald-300" />
                <h2 className="text-2xl font-black">Trust score history</h2>
              </div>
              <div className="mt-5 space-y-3">
                {profile.trustScoreRecords.map((event) => (
                  <div key={event.id} className="flex gap-3 rounded-2xl bg-slate-950/70 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                    <p className="text-sm leading-6 text-slate-300">
                      Score {event.score} ({event.delta >= 0 ? "+" : ""}{event.delta}) - {event.reason}
                    </p>
                  </div>
                ))}
              </div>
            </GlassPanel>
            <GlassPanel>
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-300" />
                <h2 className="text-2xl font-black">Badges</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Verified starter", "Escrow ready", "AI proof enabled"].map((badge) => (
                  <Badge key={badge} className="bg-emerald-400 text-slate-950">{badge}</Badge>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </AgentTrustShell>
  )
}
