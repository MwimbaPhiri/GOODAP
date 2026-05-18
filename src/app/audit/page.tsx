"use client"

import { useEffect, useState } from "react"
import { ClipboardList, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, statusClasses } from "@/lib/mvp-client"

export default function AuditPage() {
  const [events, setEvents] = useState<any[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    void apiRequest<any>("/api/governance/summary")
      .then((result) => setEvents(result.auditEvents))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load audit log"))
  }, [])

  return (
    <AgentTrustShell
      eyebrow="Audit log"
      title="Every AI trust decision is preserved for oversight."
      subtitle="Agent Trust records submissions, verification reasoning, blocked executions, allowed executions, and human overrides."
    >
      {message && <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{message}</div>}
      <GlassPanel>
        <div className="mb-5 flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-emerald-300" />
          <h2 className="text-2xl font-black">Audit trail</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <p className="font-bold">{event.eventType.replaceAll("_", " ")}</p>
                </div>
                {event.submission?.status && <Badge className={statusClasses(event.submission.status)}>{event.submission.status}</Badge>}
              </div>
              <p className="mt-2 text-sm text-slate-400">{event.details}</p>
              <p className="mt-2 text-xs text-slate-500">{event.actor} / {event.submission?.agentName || "system"}</p>
            </div>
          ))}
          {!events.length && <p className="text-sm text-slate-500">No audit events yet.</p>}
        </div>
      </GlassPanel>
    </AgentTrustShell>
  )
}
