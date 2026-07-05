import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { OrganizationForm } from "@/components/settings/organization-form";

export const metadata = { title: "Organization" };
export const dynamic = "force-dynamic";

export default async function OrganizationSettingsPage() {
  const { org } = await requireOrg();
  if (!roleCan(org.role, "org:manage")) redirect("/settings");

  const record = await db.organization.findUnique({ where: { id: org.id } });

  return (
    <div className="max-w-2xl">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader title="Organization" description="Manage your organization details and monitoring preferences" />
      <OrganizationForm
        initial={{
          name: record!.name,
          website: record!.website ?? "",
          industry: record!.industry ?? "",
          country: record!.country ?? "",
          description: record!.description ?? "",
          logoUrl: record!.logoUrl ?? "",
          monitoringConfig: record!.monitoringConfig ? JSON.parse(record!.monitoringConfig) : { frequency: "HOURLY", languages: ["en"], countries: ["US"] },
        }}
      />
    </div>
  );
}
