"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Building2, ShieldCheck, UserRoundCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { apiRequest, storeUser, type MvpUser } from "@/lib/mvp-client"

const roles = [
  { label: "Client", value: "CLIENT", icon: Building2, copy: "Create tasks, fund escrow, approve or dispute outcomes." },
  { label: "Worker", value: "WORKER", icon: UserRoundCheck, copy: "Accept work, submit proof, and grow a trust score." },
  { label: "AI agent", value: "AI_AGENT", icon: Bot, copy: "Receive tasks and submit auditable output proof." },
  { label: "Admin", value: "ADMIN", icon: ShieldCheck, copy: "Review disputes, audit decisions, and monitor risk." },
]

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState("register")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    const form = new FormData(event.currentTarget)
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login"
    const payload =
      mode === "register"
        ? {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
            phone: form.get("phone"),
            country: form.get("country") || "Zambia",
            role: form.get("role"),
            organizationName: form.get("organizationName"),
          }
        : {
            email: form.get("email"),
            password: form.get("password"),
          }

    try {
      const result = await apiRequest<{ user: MvpUser }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      storeUser(result.user)
      router.push("/dashboard")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AgentTrustShell
      eyebrow="Working MVP authentication"
      title="Register or log in with email and password."
      subtitle="This hackathon build uses a simple local session in the browser and a Prisma-backed user table. It is intentionally lightweight for demo readiness."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-900">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TabsContent value="register" className="mt-0 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" name="name" required placeholder="Chanda Mwila" className="border-white/10 bg-white/5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" placeholder="+260 97 000 0000" className="border-white/10 bg-white/5 text-white" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" placeholder="Zambia" className="border-white/10 bg-white/5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization</Label>
                    <Input id="organizationName" name="organizationName" placeholder="CopperCart SME" className="border-white/10 bg-white/5 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select id="role" name="role" className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white">
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@agenttrust.africa" className="border-white/10 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder="Minimum 8 characters" className="border-white/10 bg-white/5 text-white" />
              </div>

              {message && <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{message}</p>}
              <Button disabled={loading} className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                {loading ? "Please wait..." : mode === "register" ? "Create account" : "Login"}
              </Button>
            </form>
          </Tabs>
        </GlassPanel>

        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <GlassPanel key={role.value}>
                <Icon className="h-8 w-8 text-emerald-300" />
                <h2 className="mt-4 text-2xl font-black">{role.label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{role.copy}</p>
              </GlassPanel>
            )
          })}
        </div>
      </div>
    </AgentTrustShell>
  )
}
