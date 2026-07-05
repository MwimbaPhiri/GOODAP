import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { competitorSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("competitors:manage");
    const { id } = await params;
    const existing = await db.competitor.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Competitor not found");
    const input = competitorSchema.partial().parse(await req.json());
    const competitor = await db.competitor.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.website !== undefined && { website: input.website }),
        ...(input.keywords !== undefined && { keywords: JSON.stringify(input.keywords) }),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "competitor.update", entityType: "competitor", entityId: id });
    return ok(competitor);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("competitors:manage");
    const { id } = await params;
    const existing = await db.competitor.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Competitor not found");
    await db.competitor.delete({ where: { id } });
    await audit({ userId: user.id, organizationId: org.id, action: "competitor.delete", entityType: "competitor", entityId: id });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
