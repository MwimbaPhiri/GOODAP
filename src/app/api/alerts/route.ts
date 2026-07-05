import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";
import { alertSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const [alerts, events] = await Promise.all([
      db.alert.findMany({
        where: { organizationId: org.id },
        include: { _count: { select: { events: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.alertEvent.findMany({
        where: { alert: { organizationId: org.id } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);
    return ok({
      alerts: alerts.map((a) => ({
        ...a,
        condition: JSON.parse(a.condition || "{}"),
        channels: JSON.parse(a.channels || "[]"),
        eventCount: a._count.events,
      })),
      events,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("alerts:manage");
    const input = alertSchema.parse(await req.json());
    const alert = await db.alert.create({
      data: {
        organizationId: org.id,
        name: input.name,
        type: input.type,
        condition: JSON.stringify(input.condition ?? {}),
        channels: JSON.stringify(input.channels),
        enabled: input.enabled,
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "alert.create", entityType: "alert", entityId: alert.id });
    return created(alert);
  } catch (error) {
    return handleError(error);
  }
}
