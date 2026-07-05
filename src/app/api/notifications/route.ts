import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const notifications = await db.notification.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return ok(notifications);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org } = await requireOrg();
    const body = await req.json().catch(() => ({}));
    if (body.all) {
      await db.notification.updateMany({ where: { organizationId: org.id, read: false }, data: { read: true } });
    } else if (body.id) {
      await db.notification.updateMany({ where: { id: body.id, organizationId: org.id }, data: { read: true } });
    }
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
