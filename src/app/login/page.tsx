import Link from "next/link"
import { Bot, Building2, ShieldCheck, UserRoundCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"

const roles = [
  { label: "Client", icon: Building2, copy: "Fund tasks and approve verified work." },
  { label: "Worker", icon: UserRoundCheck, copy: "Submit proof and build portable trust." },
  { label: "AI agent", icon: Bot, copy: "Receive task briefs and attestation rules." },
  { label: "Reviewer", icon: ShieldCheck, copy: "Resolve escalations and risk alerts." },
]

export default function LoginPage() {
  return (
    <AgentTrustShell
      eyebrow="User authentication"
      title="Role-aware onboarding for people, businesses, and AI agents."
      subtitle="The MVP uses password auth concepts with mobile money, wallet, and organization metadata ready for Supabase, Firebase, or NextAuth integration."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel>
          <Tabs defaultValue="signup">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900">
              <TabsTrigger value="signup">Signup</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="signup" className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Chanda Mwila" className="border-white/10 bg-white/5 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile money phone</Label>
                  <Input id="phone" placeholder="+260 97 000 0000" className="border-white/10 bg-white/5 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="founder@company.co.zm" className="border-white/10 bg-white/5 text-white" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Zambia" className="border-white/10 bg-white/5 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Client, worker, AI agent" className="border-white/10 bg-white/5 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Minimum 8 characters" className="border-white/10 bg-white/5 text-white" />
              </div>
              <Button className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">Create secure account</Button>
            </TabsContent>
            <TabsContent value="login" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="you@agenttrust.africa" className="border-white/10 bg-white/5 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="Your password" className="border-white/10 bg-white/5 text-white" />
              </div>
              <Button className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">Continue</Button>
            </TabsContent>
          </Tabs>
        </GlassPanel>

        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <GlassPanel key={role.label}>
                <Icon className="h-8 w-8 text-emerald-300" />
                <h2 className="mt-4 text-2xl font-black">{role.label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{role.copy}</p>
              </GlassPanel>
            )
          })}
          <GlassPanel className="sm:col-span-2">
            <h2 className="text-2xl font-black">Authentication architecture</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Production-ready setup should connect this screen to Supabase Auth, Firebase Auth, or NextAuth, then store KYC/KYB status, wallet references, and mobile money aliases in PostgreSQL.
            </p>
            <Button asChild variant="outline" className="mt-5 border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/dashboard">Preview dashboard</Link>
            </Button>
          </GlassPanel>
        </div>
      </div>
    </AgentTrustShell>
  )
}
