import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import { keywordSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("keywords:manage");
    const { id } = await params;
    const existing = await db.keyword.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Keyword not found");

    const input = keywordSchema.partial().parse(await req.json());
    const keyword = await db.keyword.update({
      where: { id },
      data: {
        ...(input.term !== undefined && { term: input.term }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.booleanQuery !== undefined && { booleanQuery: input.booleanQuery }),
        ...(input.includeKeywords !== undefined && { includeKeywords: JSON.stringify(input.includeKeywords) }),
        ...(input.excludeKeywords !== undefined && { excludeKeywords: JSON.stringify(input.excludeKeywords) }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.language !== undefined && { language: input.language }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "keyword.update", entityType: "keyword", entityId: id });
    return ok(keyword);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org, user } = await requirePermission("keywords:manage");
    const { id } = await params;
    const existing = await db.keyword.findFirst({ where: { id, organizationId: org.id } });
    if (!existing) return fail(404, "Keyword not found");
    await db.keyword.delete({ where: { id } });
    await audit({ userId: user.id, organizationId: org.id, action: "keyword.delete", entityType: "keyword", entityId: id });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
