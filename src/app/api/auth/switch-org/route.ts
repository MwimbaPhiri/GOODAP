import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { setActiveOrg } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const { organizationId } = await req.json();
    if (!organizationId) return fail(400, "organizationId is required");

    const membership = await db.membership.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
    });
    if (!membership) return fail(403, "You are not a member of this organization");

    await setActiveOrg(organizationId);
    return ok({ organizationId });
  } catch (error) {
    return handleError(error);
  }
}
