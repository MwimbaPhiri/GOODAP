import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";

export async function GET() {
  try {
    const { org } = await requirePermission("org:view");
    const [members, invitations] = await Promise.all([
      db.membership.findMany({
        where: { organizationId: org.id },
        include: { user: { select: { id: true, name: true, email: true, avatar: true, jobTitle: true, lastLoginAt: true } } },
        orderBy: { createdAt: "asc" },
      }),
      db.invitation.findMany({ where: { organizationId: org.id, status: "PENDING" }, orderBy: { createdAt: "desc" } }),
    ]);
    return ok({
      members: members.map((m) => ({ membershipId: m.id, role: m.role, ...m.user })),
      invitations: invitations.map((i) => ({ id: i.id, email: i.email, role: i.role, expiresAt: i.expiresAt })),
    });
  } catch (error) {
    return handleError(error);
  }
}
