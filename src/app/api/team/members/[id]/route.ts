import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { audit } from "@/lib/audit";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum([ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("members:manage");
    const { id } = await params;
    const membership = await db.membership.findFirst({ where: { id, organizationId: org.id } });
    if (!membership) return fail(404, "Member not found");
    if (membership.userId === user.id) return fail(400, "You cannot change your own role");

    const { role } = roleSchema.parse(await req.json());
    const updated = await db.membership.update({ where: { id }, data: { role } });
    await audit({ userId: user.id, organizationId: org.id, action: "member.role_change", entityId: id, metadata: { role } });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("members:manage");
    const { id } = await params;
    const membership = await db.membership.findFirst({ where: { id, organizationId: org.id } });
    if (!membership) return fail(404, "Member not found");
    if (membership.userId === user.id) return fail(400, "You cannot remove yourself");

    const adminCount = await db.membership.count({ where: { organizationId: org.id, role: ROLES.ADMINISTRATOR } });
    if (membership.role === ROLES.ADMINISTRATOR && adminCount <= 1) return fail(400, "Cannot remove the last administrator");

    await db.membership.delete({ where: { id } });
    await audit({ userId: user.id, organizationId: org.id, action: "member.remove", entityId: id });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
