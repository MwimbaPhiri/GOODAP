import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { assistantSchema } from "@/lib/validations";
import { answer } from "@/lib/ai/rag";
import type { ChatMessage } from "@/lib/ai/client";
import { audit } from "@/lib/audit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("ai:use");
    const input = assistantSchema.parse(await req.json());

    let conversation = input.conversationId
      ? await db.conversation.findFirst({ where: { id: input.conversationId, organizationId: org.id } })
      : null;
    if (!conversation) {
      conversation = await db.conversation.create({
        data: { organizationId: org.id, userId: user.id, title: input.message.slice(0, 60) },
      });
    }

    const history = await db.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    await db.message.create({ data: { conversationId: conversation.id, role: "user", content: input.message } });

    const result = await answer(
      org.id,
      input.message,
      history.map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }))
    );

    const assistantMsg = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: result.answer,
        citations: JSON.stringify(result.citations.map((c) => ({ id: c.id, title: c.title, publication: c.publication, url: c.url }))),
      },
    });
    await db.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    await audit({ userId: user.id, organizationId: org.id, action: "ai.assistant", metadata: { usedAI: result.usedAI } });

    return ok({
      conversationId: conversation.id,
      message: { id: assistantMsg.id, role: "assistant", content: result.answer },
      citations: result.citations.map((c) => ({ id: c.id, title: c.title, publication: c.publication, url: c.url })),
      usedAI: result.usedAI,
    });
  } catch (error) {
    return handleError(error);
  }
}
