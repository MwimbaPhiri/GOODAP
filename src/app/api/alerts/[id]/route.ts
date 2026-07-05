import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { alertSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("alerts:manage");
    const { id } = await params;
    const existing = await db.alert.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Alert not found");
    const input = alertSchema.partial().parse(await req.json());
    const alert = await db.alert.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.condition !== undefined && { condition: JSON.stringify(input.condition) }),
        ...(input.channels !== undefined && { channels: JSON.stringify(input.channels) }),
        ...(input.enabled !== undefined && { enabled: input.enabled }),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "alert.update", entityType: "alert", entityId: id });
    return ok(alert);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("alerts:manage");
    const { id } = await params;
    const existing = await db.alert.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Alert not found");
    await db.alert.delete({ where: { id } });
    await audit({ userId: user.id, organizationId: org.id, action: "alert.delete", entityType: "alert", entityId: id });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
