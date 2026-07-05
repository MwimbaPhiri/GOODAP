import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";
import { reportSchema } from "@/lib/validations";
import { generateReport } from "@/lib/reports";
import { audit } from "@/lib/audit";

export const maxDuration = 60;

export async function GET() {
  try {
    const { org } = await requireOrg();
    const reports = await db.report.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, type: true, status: true, periodStart: true, periodEnd: true, createdAt: true, createdBy: { select: { name: true } } },
    });
    return ok(reports);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("reports:manage");
    const input = reportSchema.parse(await req.json());

    const data = await generateReport(org.id, input);
    const report = await db.report.create({
      data: {
        organizationId: org.id,
        createdById: user.id,
        title: input.title,
        type: input.type,
        periodStart: new Date(data.period.start),
        periodEnd: new Date(data.period.end),
        status: "READY",
        data: JSON.stringify(data),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "report.generate", entityType: "report", entityId: report.id });
    return created({ id: report.id, ...data });
  } catch (error) {
    return handleError(error);
  }
}
