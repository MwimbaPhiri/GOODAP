import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsClient } from "@/components/reports/reports-client";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const { org } = await requireOrg();
  return (
    <div>
      <PageHeader title="Reports" description="Generate rich media reports with charts, tables, AI commentary and recommendations" />
      <ReportsClient canManage={roleCan(org.role, "reports:manage")} />
    </div>
  );
}
