import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, created } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { inviteSchema } from "@/lib/validations";
import { addDays, generateToken, hashToken } from "@/lib/auth/tokens";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("members:invite");
    const input = inviteSchema.parse(await req.json());
    const email = input.email.toLowerCase();

    const existing = await db.membership.findFirst({ where: { organizationId: org.id, user: { email } } });
    if (existing) return fail(409, "This person is already a member");

    const token = generateToken();
    await db.invitation.create({
      data: {
        organizationId: org.id,
        email,
        role: input.role,
        tokenHash: hashToken(token),
        invitedById: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "member.invite", metadata: { email, role: input.role } });

    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/accept-invite?token=${token}`;
    return created({ sent: true, devInviteUrl: process.env.NODE_ENV === "production" ? undefined : acceptUrl });
  } catch (error) {
    return handleError(error);
  }
}
