import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { KeywordsClient } from "@/components/keywords/keywords-client";

export const metadata = { title: "Keywords" };

export default async function KeywordsPage() {
  const { org } = await requireOrg();
  const canManage = roleCan(org.role, "keywords:manage");
  return (
    <div>
      <PageHeader title="Keyword monitoring" description="Track company names, products, executives, campaigns and industry terms" />
      <KeywordsClient canManage={canManage} />
    </div>
  );
}
