import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireOrg();
    const { id } = await params;
    const report = await db.report.findFirst({ where: { id, organizationId: org.id } });
    if (!report) return fail(404, "Report not found");
    return ok({ id: report.id, ...(report.data ? JSON.parse(report.data) : {}) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requirePermission("reports:manage");
    const { id } = await params;
    const existing = await db.report.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Report not found");
    await db.report.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
