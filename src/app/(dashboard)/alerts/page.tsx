import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { AlertsClient } from "@/components/alerts/alerts-client";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const { org } = await requireOrg();
  return (
    <div>
      <PageHeader title="Alerts" description="Get notified about negative sentiment, keyword spikes, competitor activity and breaking news" />
      <AlertsClient canManage={roleCan(org.role, "alerts:manage")} />
    </div>
  );
}
