import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { runCollectionForOrg } from "@/lib/monitoring/engine";

export const maxDuration = 300;

/**
 * Scheduled monitoring entrypoint. Configure a Vercel Cron (see vercel.json) or
 * any external scheduler to call this endpoint. Protected by the CRON_SECRET.
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization")?.replace("Bearer ", "") || req.nextUrl.searchParams.get("secret");
  if (secret && provided !== secret) return fail(401, "Unauthorized");

  const orgs = await db.organization.findMany({ select: { id: true, name: true } });
  const results: Array<{ org: string; created?: number; alerts?: number; error?: string }> = [];
  for (const org of orgs) {
    try {
      const summary = await runCollectionForOrg(org.id, { perSourceLimit: 15 });
      results.push({ org: org.name, created: summary.created, alerts: summary.alertsTriggered });
    } catch (err) {
      results.push({ org: org.name, error: err instanceof Error ? err.message : "failed" });
    }
  }
  return ok({ ranAt: new Date().toISOString(), organizations: results });
}

export const GET = handle;
export const POST = handle;
