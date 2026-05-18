import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { activeTasks, chatMessages, dashboardMetrics, notifications } from "@/lib/agent-trust-data"

export default function DashboardPage() {
  return (
    <AgentTrustShell
      eyebrow="Client and worker dashboard"
      title="One command center for tasks, escrow, verification, and alerts."
      subtitle="A responsive fintech dashboard showing the most important operational signals for clients, workers, AI agents, and reviewers."
    >
      <div className="grid gap-4 md:grid-cols-4">
        {dashboardMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <GlassPanel key={metric.label}>
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-emerald-300" />
                <Badge className="bg-white/10 text-slate-200">{metric.trend}</Badge>
              </div>
              <p className="mt-5 text-sm text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-black">{metric.value}</p>
            </GlassPanel>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassPanel>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Active trust pipeline</h2>
            <Badge className="bg-emerald-400 text-slate-950">Live</Badge>
          </div>
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-emerald-200">{task.id} / {task.milestone}</p>
                    <h3 className="mt-1 text-xl font-bold">{task.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{task.client} to {task.worker} / {task.amount}</p>
                  </div>
                  <Badge className={task.risk === "high" ? "bg-red-400 text-slate-950" : task.risk === "medium" ? "bg-amber-300 text-slate-950" : "bg-emerald-400 text-slate-950"}>
                    {task.risk} risk
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Progress value={task.score} className="bg-white/10" />
                  <span className="w-14 text-right text-sm text-emerald-200">{task.score}%</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{task.status}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel>
            <h2 className="text-2xl font-black">Notifications</h2>
            <div className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <div key={notification} className="rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">
                  {notification}
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel>
            <h2 className="text-2xl font-black">Task room</h2>
            <div className="mt-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={`${message.sender}-${message.time}`} className="rounded-2xl bg-slate-950/70 p-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{message.sender}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{message.body}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </AgentTrustShell>
  )
}
