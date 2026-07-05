import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { sourceSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("keywords:manage");
    const { id } = await params;
    const existing = await db.source.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Source not found");
    const input = sourceSchema.partial().parse(await req.json());
    const source = await db.source.update({ where: { id }, data: input });
    await audit({ userId: user.id, organizationId: org.id, action: "source.update", entityType: "source", entityId: id });
    return ok(source);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("keywords:manage");
    const { id } = await params;
    const existing = await db.source.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Source not found");
    await db.source.delete({ where: { id } });
    await audit({ userId: user.id, organizationId: org.id, action: "source.delete", entityType: "source", entityId: id });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
