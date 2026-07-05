import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth/session";
import { ReportView } from "@/components/reports/report-view";
import type { ReportData } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { org } = await requireOrg();
  const { id } = await params;
  const report = await db.report.findFirst({ where: { id, organizationId: org.id } });
  if (!report || !report.data) notFound();

  const data = JSON.parse(report.data) as ReportData;

  return (
    <div>
      <Link href="/reports" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to reports
      </Link>
      <ReportView data={{ ...data, id: report.id }} />
    </div>
  );
}
