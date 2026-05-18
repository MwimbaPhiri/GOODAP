"use client"

import { FormEvent, use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, getStoredUser, type MvpUser } from "@/lib/mvp-client"

export default function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<MvpUser | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) {
      setMessage("Please login as the assigned worker or AI agent.")
      return
    }

    const form = new FormData(event.currentTarget)
    setLoading(true)
    setMessage("")

    try {
      await apiRequest("/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          taskId: id,
          submittedById: user.id,
          notes: form.get("notes"),
          fileNames: String(form.get("fileNames") || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          proofTypes: String(form.get("proofTypes") || "text,file")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      })
      router.push(`/tasks/${id}/result`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit proof")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AgentTrustShell
      eyebrow="Task submission"
      title="Submit completion proof for AI verification."
      subtitle="For hackathon demo readiness, file upload is simulated by entering filenames. The verification engine still checks file presence, keyword matches, and proof quality."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <GlassPanel>
          {!user && (
            <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              Please <Link href="/login" className="font-bold underline">login</Link> before submitting proof.
            </div>
          )}
          {message && <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Completion proof</Label>
              <Textarea
                id="notes"
                name="notes"
                required
                placeholder="I completed the landing page, hero copy, pricing card, WhatsApp CTA, and uploaded screenshots. The work includes mobile responsive sections and all requested assets."
                className="min-h-44 border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileNames">Simulated file uploads</Label>
              <Input id="fileNames" name="fileNames" placeholder="landing-page.png, mobile-screenshot.png, copy.docx" className="border-white/10 bg-white/5 text-white" />
              <p className="text-xs text-slate-500">Comma-separated filenames. Add at least one for a stronger score.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofTypes">Proof types</Label>
              <Input id="proofTypes" name="proofTypes" placeholder="text,screenshot,file,link" className="border-white/10 bg-white/5 text-white" />
            </div>
            <Button disabled={loading || !user} className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              {loading ? "Verifying..." : "Submit proof and run verification"}
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel>
          <h2 className="text-2xl font-black">Mock AI scoring formula</h2>
          <div className="mt-5 space-y-3">
            {[
              "Keyword matching against task deliverables",
              "Completeness based on matched deliverables",
              "File presence and proof type variety",
              "Text quality and measurable details",
              "Fraud flags for short notes or duplicate file names",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="bg-emerald-400 text-slate-950">PASS</Badge>
            <Badge className="bg-amber-300 text-slate-950">NEEDS REVIEW</Badge>
            <Badge className="bg-red-400 text-slate-950">FAIL</Badge>
          </div>
        </GlassPanel>
      </div>
    </AgentTrustShell>
  )
}
