import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { setActiveOrg } from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/tokens";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const { token } = await req.json();
    if (!token) return fail(400, "Invitation token is required");

    const invite = await db.invitation.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      return fail(400, "This invitation is invalid or has expired");
    }
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return fail(403, "This invitation was sent to a different email address");
    }

    const existing = await db.membership.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: invite.organizationId } },
    });
    if (!existing) {
      await db.membership.create({ data: { userId: user.id, organizationId: invite.organizationId, role: invite.role } });
    }
    await db.invitation.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
    await setActiveOrg(invite.organizationId);
    await audit({ userId: user.id, organizationId: invite.organizationId, action: "member.accept_invite" });

    return ok({ organizationId: invite.organizationId });
  } catch (error) {
    return handleError(error);
  }
}
