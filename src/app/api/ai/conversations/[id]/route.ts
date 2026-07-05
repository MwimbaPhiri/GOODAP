import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requireOrg();
    const { id } = await params;
    const conversation = await db.conversation.findFirst({
      where: { id, organizationId: org.id, userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) return fail(404, "Conversation not found");
    return ok({
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        citations: m.citations ? JSON.parse(m.citations) : [],
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
