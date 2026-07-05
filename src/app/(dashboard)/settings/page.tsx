import Link from "next/link";
import { User, Building2, Users, ShieldCheck, SlidersHorizontal, ChevronRight } from "lucide-react";
import { requireOrg } from "@/lib/auth/session";
import { ROLE_LABELS, roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { org } = await requireOrg();
  const canManageOrg = roleCan(org.role, "org:manage");
  const canManageMembers = roleCan(org.role, "members:manage");

  const items = [
    { href: "/settings/profile", icon: User, title: "Profile", desc: "Your name, title and preferences", show: true },
    { href: "/settings/organization", icon: Building2, title: "Organization", desc: "Name, branding and monitoring preferences", show: canManageOrg },
    { href: "/settings/team", icon: Users, title: "Team & roles", desc: "Invite members and manage permissions", show: canManageMembers },
  ].filter((i) => i.show);

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and organization" />

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Your role in {org.name}</p>
              <p className="text-xs text-muted-foreground">Determines what you can view and manage</p>
            </div>
          </div>
          <Badge variant="secondary">{ROLE_LABELS[org.role]}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <Link key={i.href} href={i.href}>
            <Card className="transition-colors hover:border-primary/30">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><i.icon className="size-5" /></div>
                <div className="flex-1">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-sm text-muted-foreground">{i.desc}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
