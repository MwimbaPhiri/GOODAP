"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { BrainCircuit, FileWarning, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest } from "@/lib/mvp-client"

export default function SubmitPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    const form = new FormData(event.currentTarget)

    try {
      const result = await apiRequest<{ submission: { id: string } }>("/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          agentName: form.get("agentName"),
          agentType: form.get("agentType"),
          taskTitle: form.get("taskTitle"),
          taskRequirements: form.get("taskRequirements"),
          outputText: form.get("outputText"),
          explanation: form.get("explanation"),
          evidenceFiles: form.get("evidenceFiles"),
          riskContext: form.get("riskContext"),
          actionLabel: form.get("actionLabel"),
        }),
      })
      router.push(`/submissions/${result.submission.id}/result`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AgentTrustShell
      eyebrow="AI output submission"
      title="Submit an autonomous agent output to the trust gate."
      subtitle="Agent Trust evaluates the output before any simulated real-world action is allowed."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <GlassPanel>
          {message && <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent name</Label>
              <Input id="agentName" name="agentName" required placeholder="OpsAgent-7" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentType">Agent type</Label>
              <Input id="agentType" name="agentType" placeholder="research_agent, workflow_agent" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="taskTitle">Task title</Label>
              <Input id="taskTitle" name="taskTitle" required placeholder="Approve vendor onboarding summary" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="taskRequirements">Required checks / deliverables</Label>
              <Textarea id="taskRequirements" name="taskRequirements" required placeholder="vendor identity, bank details, risk score, supporting documents" className="min-h-24 border-white/10 bg-white/5 text-white" />
              <p className="text-xs text-slate-500">Comma-separated. These are used for relevance and completeness scoring.</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="outputText">Agent output</Label>
              <Textarea id="outputText" name="outputText" required placeholder="The AI agent's final result, recommendation, or workflow output..." className="min-h-36 border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="explanation">Agent explanation</Label>
              <Textarea id="explanation" name="explanation" required placeholder="Explain how the agent reached this output and what evidence it used." className="min-h-28 border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidenceFiles">Evidence files</Label>
              <Input id="evidenceFiles" name="evidenceFiles" placeholder="report.pdf, screenshot.png" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionLabel">Simulated action</Label>
              <Input id="actionLabel" name="actionLabel" placeholder="Approve workflow completion" className="border-white/10 bg-white/5 text-white" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="riskContext">Risk context</Label>
              <Textarea id="riskContext" name="riskContext" placeholder="What downstream system, payment, or operational action would this trigger?" className="min-h-20 border-white/10 bg-white/5 text-white" />
            </div>
            <Button disabled={loading} className="sm:col-span-2 bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              {loading ? "Verifying..." : "Submit to trust gate"}
            </Button>
          </form>
        </GlassPanel>

        <div className="space-y-6">
          <InfoCard icon={ShieldCheck} title="PASS" copy="Execution is allowed and logged only when the final trust score is 80 or higher." />
          <InfoCard icon={BrainCircuit} title="REVIEW" copy="Execution stays blocked until a human reviewer overrides the uncertainty." />
          <InfoCard icon={FileWarning} title="FAIL" copy="Execution is blocked when output is incomplete, unsupported, contradictory, or high risk." />
        </div>
      </div>
    </AgentTrustShell>
  )
}

function InfoCard({ icon: Icon, title, copy }: { icon: any; title: string; copy: string }) {
  return (
    <GlassPanel>
      <Icon className="h-8 w-8 text-emerald-300" />
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
    </GlassPanel>
  )
}
