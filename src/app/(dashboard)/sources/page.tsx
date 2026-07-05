import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { SourcesClient } from "@/components/sources/sources-client";

export const metadata = { title: "Sources" };

export default async function SourcesPage() {
  const { org } = await requireOrg();
  return (
    <div>
      <PageHeader title="Media sources" description="Manage the collectors that feed your monitoring — RSS, Google News and web scrapers" />
      <SourcesClient canManage={roleCan(org.role, "keywords:manage")} />
    </div>
  );
}
