import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireOrg();
    const sp = req.nextUrl.searchParams;

    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(sp.get("pageSize") ?? 20)));

    const where: Prisma.ArticleWhereInput = { organizationId: org.id };

    const q = sp.get("q")?.trim();
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { publication: { contains: q } },
        { author: { contains: q } },
      ];
    }
    const sentiment = sp.get("sentiment");
    if (sentiment && sentiment !== "ALL") where.sentiment = sentiment;
    const risk = sp.get("risk");
    if (risk && risk !== "ALL") where.riskLevel = risk;
    const source = sp.get("source");
    if (source && source !== "ALL") where.publication = source;
    const author = sp.get("author")?.trim();
    if (author) where.author = { contains: author };
    const country = sp.get("country");
    if (country && country !== "ALL") where.country = country;
    const language = sp.get("language");
    if (language && language !== "ALL") where.language = language;
    const topic = sp.get("topic")?.trim();
    if (topic) where.topics = { contains: topic };
    const from = sp.get("from");
    const to = sp.get("to");
    if (from || to) {
      where.publishedAt = {};
      if (from) (where.publishedAt as Prisma.DateTimeFilter).gte = new Date(from);
      if (to) (where.publishedAt as Prisma.DateTimeFilter).lte = new Date(`${to}T23:59:59`);
    }

    const [total, articles] = await Promise.all([
      db.article.count({ where }),
      db.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, title: true, author: true, publication: true, url: true, imageUrl: true,
          excerpt: true, sentiment: true, sentimentScore: true, riskLevel: true, category: true,
          readingTime: true, topics: true, country: true, language: true, publishedAt: true,
        },
      }),
    ]);

    return ok({
      articles: articles.map((a) => ({ ...a, topics: safeParse(a.topics), publishedAt: a.publishedAt?.toISOString() ?? null })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
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
