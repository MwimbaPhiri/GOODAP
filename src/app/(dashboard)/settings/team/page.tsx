import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { TeamClient } from "@/components/settings/team-client";

export const metadata = { title: "Team" };

export default async function TeamSettingsPage() {
  const { org } = await requireOrg();
  if (!roleCan(org.role, "members:manage")) redirect("/settings");

  return (
    <div>
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader title="Team & roles" description="Invite members and manage their permissions" />
      <TeamClient canInvite={roleCan(org.role, "members:invite")} />
    </div>
  );
}
