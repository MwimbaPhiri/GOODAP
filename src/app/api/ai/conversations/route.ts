import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";

export async function GET() {
  try {
    const { org, user } = await requireOrg();
    const conversations = await db.conversation.findMany({
      where: { organizationId: org.id, userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { id: true, title: true, updatedAt: true },
    });
    return ok(conversations);
  } catch (error) {
    return handleError(error);
  }
}
