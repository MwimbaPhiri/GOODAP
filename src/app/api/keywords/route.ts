import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";
import { keywordSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const keywords = await db.keyword.findMany({
      where: { organizationId: org.id },
      include: { _count: { select: { matches: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(
      keywords.map((k) => ({
        ...k,
        includeKeywords: JSON.parse(k.includeKeywords || "[]"),
        excludeKeywords: JSON.parse(k.excludeKeywords || "[]"),
        matchCount: k._count.matches,
      }))
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("keywords:manage");
    const input = keywordSchema.parse(await req.json());
    const keyword = await db.keyword.create({
      data: {
        organizationId: org.id,
        term: input.term,
        type: input.type,
        booleanQuery: input.booleanQuery ?? null,
        includeKeywords: JSON.stringify(input.includeKeywords),
        excludeKeywords: JSON.stringify(input.excludeKeywords),
        country: input.country ?? null,
        language: input.language,
        priority: input.priority,
        status: input.status,
        frequency: input.frequency,
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "keyword.create", entityType: "keyword", entityId: keyword.id });
    return created(keyword);
  } catch (error) {
    return handleError(error);
  }
}
