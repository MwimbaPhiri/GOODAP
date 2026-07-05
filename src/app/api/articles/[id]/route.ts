import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { org } = await requireOrg();
    const { id } = await params;
    const article = await db.article.findFirst({
      where: { id, organizationId: org.id },
      include: {
        entities: { orderBy: { salience: "desc" } },
        source: { select: { name: true, type: true, domainAuthority: true } },
        competitor: { select: { name: true } },
        keywords: { include: { keyword: { select: { term: true, type: true } } } },
      },
    });
    if (!article) return fail(404, "Article not found");

    return ok({
      ...article,
      topics: safeParse(article.topics),
      publishedAt: article.publishedAt?.toISOString() ?? null,
      collectedAt: article.collectedAt.toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}

function safeParse(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
