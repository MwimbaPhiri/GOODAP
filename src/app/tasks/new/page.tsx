"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, getStoredUser, type MvpUser } from "@/lib/mvp-client"

const milestones = [
  "Client creates task and simulated escrow is funded",
  "Worker or AI agent accepts the task",
  "Worker submits text proof and simulated files",
  "Rule-based verification returns PASS, FAIL, or NEEDS REVIEW",
  "Client approves release or opens a dispute",
]

export default function CreateTaskPage() {
  const router = useRouter()
  const [invitedAgentId, setInvitedAgentId] = useState<string | null>(null)
  const [user, setUser] = useState<MvpUser | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setInvitedAgentId(new URLSearchParams(window.location.search).get("agentId"))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) {
      setMessage("Please login as a client before creating a task.")
      return
    }

    setLoading(true)
    setMessage("")
    const form = new FormData(event.currentTarget)

    try {
      const result = await apiRequest<{ task: { id: string } }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          amount: Number(form.get("amount")),
          currency: form.get("currency") || "ZMW",
          paymentRail: form.get("paymentRail") || "Airtel Money",
          releaseThreshold: Number(form.get("releaseThreshold") || 80),
          deliverables: String(form.get("deliverables") || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          clientId: user.id,
          assigneeId: invitedAgentId || undefined,
          fundEscrow: true,
          milestones: [{ title: "Verified completion", payoutPercent: 100 }],
        }),
      })
      router.push(`/tasks/${result.task.id}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AgentTrustShell
      eyebrow="Working task creation"
      title="Create an escrow-backed task in under a minute."
      subtitle="The MVP immediately creates a simulated payment record and funded escrow account so the rest of the workflow can be demoed end-to-end."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel>
          {!user && (
            <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              You are not logged in. <Link href="/login" className="font-bold underline">Login or register</Link> to create a task.
            </div>
          )}
          {message && <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}
          {invitedAgentId && (
            <div className="mb-5 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">
              This task will be assigned to the selected marketplace agent after creation.
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Task title</Label>
              <Input id="title" name="title" required placeholder="Design a landing page for CopperCart" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Build a mobile-first fintech-style landing page with hero copy, pricing card, WhatsApp CTA, and delivery screenshots."
                className="min-h-28 border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Escrow amount</Label>
              <Input id="amount" name="amount" type="number" required min="1" placeholder="7500" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" placeholder="ZMW" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="deliverables">Deliverables / keywords</Label>
              <Textarea
                id="deliverables"
                name="deliverables"
                required
                placeholder="landing page, hero copy, pricing card, WhatsApp CTA, screenshots"
                className="min-h-24 border-white/10 bg-white/5 text-white"
              />
              <p className="text-xs text-slate-500">Comma-separated. These become the keywords used by the mock AI verification engine.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="releaseThreshold">PASS threshold</Label>
              <Input id="releaseThreshold" name="releaseThreshold" type="number" min="1" max="100" placeholder="80" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentRail">Payment rail</Label>
              <Input id="paymentRail" name="paymentRail" placeholder="Airtel Money" className="border-white/10 bg-white/5 text-white" />
            </div>
            <Button disabled={loading || !user} className="sm:col-span-2 bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              {loading ? "Creating..." : "Create task and fund simulated escrow"}
            </Button>
          </form>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel>
            <h2 className="text-2xl font-black">Demo workflow</h2>
            <div className="mt-5 space-y-3">
              {milestones.map((milestone, index) => (
                <div key={milestone} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-300">{milestone}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel>
            <h2 className="text-2xl font-black">Verification inputs</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Keyword matching", "Completeness", "File presence", "Quality score", "Fraud flags"].map((item) => (
                <Badge key={item} className="border border-white/10 bg-white/5 text-slate-200">
                  {item}
                </Badge>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </AgentTrustShell>
  )
}
