import { NextRequest } from "next/server";
import { handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { runCollectionForOrg } from "@/lib/monitoring/engine";
import { audit } from "@/lib/audit";
import { cache } from "@/lib/cache";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("monitoring:run");
    const summary = await runCollectionForOrg(org.id);
    await cache.delByPrefix(`dashboard:${org.id}`);
    await audit({
      userId: user.id,
      organizationId: org.id,
      action: "monitoring.collect",
      metadata: { created: summary.created, duplicates: summary.duplicates },
      ip: req.headers.get("x-forwarded-for"),
    });
    return ok(summary);
  } catch (error) {
    return handleError(error);
  }
}
