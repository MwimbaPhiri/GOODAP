import { handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/stats";
import { wrap } from "@/lib/cache";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const stats = await wrap(`dashboard:${org.id}`, 30, () => getDashboardStats(org.id));
    return ok(stats);
  } catch (error) {
    return handleError(error);
  }
}
