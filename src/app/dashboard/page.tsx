"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, LogOut, Plus, WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, clearStoredUser, getStoredUser, statusClasses, type MvpUser } from "@/lib/mvp-client"

type Task = {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  status: string
  riskLevel: string
  deliverables: string[]
  clientId: string
  assigneeId?: string | null
  client?: { name?: string | null; email: string }
  assignee?: { name?: string | null; email: string; trustScore: number } | null
  verificationResults?: { score: number; decision: string }[]
  escrowAccount?: { status: string; balance: number } | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<MvpUser | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)
    void loadTasks()
  }, [])

  async function loadTasks() {
    setLoading(true)
    try {
      const result = await apiRequest<{ tasks: Task[] }>("/api/tasks")
      setTasks(result.tasks)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load tasks")
    } finally {
      setLoading(false)
    }
  }

  async function acceptTask(taskId: string) {
    if (!user) return
    await apiRequest(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "accept", userId: user.id }),
    })
    await loadTasks()
  }

  const metrics = useMemo(() => {
    const locked = tasks.reduce((sum, task) => sum + (task.status !== "RELEASED" ? task.amount : 0), 0)
    const verified = tasks.filter((task) => ["APPROVED", "RELEASED"].includes(task.status)).length
    const disputed = tasks.filter((task) => task.status === "DISPUTED").length
    return [
      { label: "Escrow locked", value: `ZMW ${locked.toLocaleString()}`, icon: WalletCards },
      { label: "Verified tasks", value: String(verified), icon: CheckCircle2 },
      { label: "Needs review", value: String(disputed), icon: AlertTriangle },
      { label: "Open tasks", value: String(tasks.filter((task) => !task.assigneeId).length), icon: Clock3 },
    ]
  }, [tasks])

  const visibleTasks = useMemo(() => {
    if (!user) return tasks
    if (user.role === "CLIENT") return tasks.filter((task) => task.clientId === user.id)
    if (user.role === "ADMIN" || user.role === "REVIEWER") return tasks
    return tasks.filter((task) => !task.assigneeId || task.assigneeId === user.id)
  }, [tasks, user])

  return (
    <AgentTrustShell
      eyebrow="Runnable MVP dashboard"
      title={user ? `Welcome back, ${user.name || user.email}` : "Log in to run the Agent Trust workflow"}
      subtitle="Create tasks as a client, accept them as a worker or AI agent, submit proof, verify completion, then approve or dispute the payout."
    >
      {!user && (
        <GlassPanel className="mb-6">
          <p className="text-slate-300">No local session found. Register or login to start the demo.</p>
          <Button asChild className="mt-4 bg-emerald-400 text-slate-950 hover:bg-emerald-300">
            <Link href="/login">Go to login</Link>
          </Button>
        </GlassPanel>
      )}

      {user && (
        <div className="mb-6 flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">{user.role.replace("_", " ")} account</p>
            <p className="text-2xl font-black text-white">Trust score {user.trustScore}/100</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Link href="/tasks/new"><Plus className="mr-2 h-4 w-4" /> Create task</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                clearStoredUser()
                setUser(null)
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <GlassPanel key={metric.label}>
              <Icon className="h-6 w-6 text-emerald-300" />
              <p className="mt-5 text-sm text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-black">{metric.value}</p>
            </GlassPanel>
          )
        })}
      </div>

      <GlassPanel className="mt-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Tasks</h2>
            <p className="text-sm text-slate-400">{loading ? "Loading tasks..." : `${visibleTasks.length} task(s) visible for this role`}</p>
          </div>
          {message && <Badge className="bg-red-400 text-slate-950">{message}</Badge>}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleTasks.map((task) => {
            const score = task.verificationResults?.[0]?.score ?? 0
            return (
              <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{task.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{task.description}</p>
                  </div>
                  <Badge className={statusClasses(task.status)}>{task.status.replace("_", " ")}</Badge>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
                  <span>{task.currency} {task.amount.toLocaleString()}</span>
                  <span>Client: {task.client?.name || task.client?.email || "Unknown"}</span>
                  <span>Worker: {task.assignee?.name || task.assignee?.email || "Open"}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={score || (task.status === "RELEASED" ? 100 : 30)} className="bg-white/10" />
                  <span className="w-12 text-right text-sm text-emerald-200">{score || 30}%</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                    <Link href={`/tasks/${task.id}`}>Open</Link>
                  </Button>
                  {user && user.role !== "CLIENT" && !task.assigneeId && (
                    <Button onClick={() => acceptTask(task.id)} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                      Accept task
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
          {!loading && visibleTasks.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-slate-400 lg:col-span-2">
              No tasks yet. Create one as a client, then log in as a worker to accept it.
            </div>
          )}
        </div>
      </GlassPanel>
    </AgentTrustShell>
  )
}
