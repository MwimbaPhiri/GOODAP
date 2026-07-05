import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { CompetitorsClient } from "@/components/competitors/competitors-client";

export const metadata = { title: "Competitors" };

export default async function CompetitorsPage() {
  const { org } = await requireOrg();
  return (
    <div>
      <PageHeader title="Competitor intelligence" description="Benchmark share of voice, sentiment and coverage volume against your competitors" />
      <CompetitorsClient canManage={roleCan(org.role, "competitors:manage")} />
    </div>
  );
}
