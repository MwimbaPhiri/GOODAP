import { db } from "@/lib/db";
import { analyzeArticle } from "@/lib/analysis";
import { dedupeHash } from "./dedupe";
import { getCollector } from "./collectors";
import type { CollectedItem } from "./types";

export interface CollectionSummary {
  organizationId: string;
  sourcesProcessed: number;
  collected: number;
  created: number;
  duplicates: number;
  errors: { source: string; message: string }[];
  alertsTriggered: number;
}

function parseList(json?: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/** Does an article's text satisfy a keyword's include/exclude rules? */
function keywordMatches(text: string, kw: { term: string; includeKeywords?: string | null; excludeKeywords?: string | null }): boolean {
  const lower = text.toLowerCase();
  const includes = parseList(kw.includeKeywords);
  const excludes = parseList(kw.excludeKeywords);

  if (excludes.some((e) => lower.includes(e.toLowerCase()))) return false;

  const base = lower.includes(kw.term.toLowerCase());
  const inclHit = includes.length === 0 ? true : includes.some((i) => lower.includes(i.toLowerCase()));
  return base && inclHit;
}

/**
 * Run the full ingestion pipeline for an organization: collect from every
 * enabled source, de-duplicate, analyze, persist, attribute keywords and
 * competitors, and evaluate alert rules.
 */
export async function runCollectionForOrg(
  organizationId: string,
  opts: { perSourceLimit?: number } = {}
): Promise<CollectionSummary> {
  const perSourceLimit = opts.perSourceLimit ?? 20;

  const [sources, keywords, competitors, alerts] = await Promise.all([
    db.source.findMany({ where: { organizationId, enabled: true } }),
    db.keyword.findMany({ where: { organizationId, status: "ACTIVE" } }),
    db.competitor.findMany({ where: { organizationId } }),
    db.alert.findMany({ where: { organizationId, enabled: true } }),
  ]);

  const terms = keywords.map((k) => k.term);
  const summary: CollectionSummary = {
    organizationId,
    sourcesProcessed: 0,
    collected: 0,
    created: 0,
    duplicates: 0,
    errors: [],
    alertsTriggered: 0,
  };

  const keywordRunCounts = new Map<string, number>();
  const createdArticles: { id: string; sentiment: string; sentimentScore: number; riskLevel: string; publication: string | null; competitorId: string | null; title: string }[] = [];

  for (const source of sources) {
    const collector = getCollector(source.type);
    if (!collector) continue;
    summary.sourcesProcessed++;

    let items: CollectedItem[] = [];
    try {
      items = await collector.collect(source.url, { terms, limit: perSourceLimit });
    } catch (err) {
      summary.errors.push({ source: source.name, message: err instanceof Error ? err.message : "collect failed" });
      continue;
    }
    summary.collected += items.length;

    for (const item of items) {
      const hash = dedupeHash(item.url, item.title);
      const exists = await db.article.findUnique({
        where: { organizationId_dedupeHash: { organizationId, dedupeHash: hash } },
        select: { id: true },
      });
      if (exists) {
        summary.duplicates++;
        continue;
      }

      const fullText = `${item.title} ${item.content ?? ""}`;
      const matched = keywords.filter((k) => keywordMatches(fullText, k));
      matched.forEach((k) => keywordRunCounts.set(k.id, (keywordRunCounts.get(k.id) ?? 0) + 1));

      const competitor = competitors.find((c) =>
        parseList(c.keywords).some((t) => fullText.toLowerCase().includes(t.toLowerCase()))
      );

      const analysis = analyzeArticle({ title: item.title, content: item.content });

      const article = await db.article.create({
        data: {
          organizationId,
          sourceId: source.id,
          competitorId: competitor?.id ?? null,
          dedupeHash: hash,
          title: item.title,
          author: item.author ?? null,
          publication: item.publication ?? source.name,
          url: item.url,
          imageUrl: item.imageUrl ?? null,
          content: item.content ?? null,
          excerpt: item.excerpt ?? null,
          language: item.language ?? source.language,
          country: item.country ?? source.country,
          publishedAt: item.publishedAt ?? new Date(),
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel,
          category: analysis.category,
          readingTime: analysis.readingTime,
          reach: (source.domainAuthority ?? 40) * 1000,
          topics: JSON.stringify(analysis.topics),
          aiSummary: analysis.aiSummary,
          suggestedPr: analysis.suggestedPr,
          suggestedPost: analysis.suggestedPost,
          analyzedAt: new Date(),
          entities: {
            create: analysis.entities.map((e) => ({ name: e.name, type: e.type, salience: e.salience })),
          },
          keywords: {
            create: matched.map((k) => ({ keywordId: k.id })),
          },
        },
      });

      summary.created++;
      createdArticles.push({
        id: article.id,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        riskLevel: analysis.riskLevel,
        publication: article.publication,
        competitorId: article.competitorId,
        title: article.title,
      });
    }

    await db.source.update({ where: { id: source.id }, data: { lastFetchedAt: new Date() } });
  }

  // Update keyword run timestamps.
  await Promise.all(
    keywords.map((k) => db.keyword.update({ where: { id: k.id }, data: { lastRunAt: new Date() } }))
  );

  summary.alertsTriggered = await evaluateAlerts(organizationId, alerts, createdArticles, keywordRunCounts, keywords);
  return summary;
}

async function evaluateAlerts(
  organizationId: string,
  alerts: { id: string; type: string; name: string; condition: string | null }[],
  articles: { id: string; sentiment: string; sentimentScore: number; riskLevel: string; publication: string | null; competitorId: string | null; title: string }[],
  keywordCounts: Map<string, number>,
  keywords: { id: string; term: string }[]
): Promise<number> {
  let triggered = 0;

  const raise = async (alertId: string, title: string, message: string, severity: string, articleId?: string) => {
    await db.alertEvent.create({ data: { alertId, title, message, severity, articleId } });
    await db.alert.update({ where: { id: alertId }, data: { lastTriggeredAt: new Date() } });
    await db.notification.create({
      data: { organizationId, title, body: message, type: "ALERT", link: articleId ? `/articles/${articleId}` : "/alerts" },
    });
    triggered++;
  };

  for (const alert of alerts) {
    let condition: Record<string, any> = {};
    try {
      condition = alert.condition ? JSON.parse(alert.condition) : {};
    } catch {
      /* ignore */
    }

    if (alert.type === "NEGATIVE_SENTIMENT") {
      const threshold = condition.threshold ?? -0.2;
      for (const a of articles.filter((x) => x.sentiment === "NEGATIVE" && x.sentimentScore <= threshold)) {
        await raise(alert.id, `Negative coverage detected`, `"${a.title.slice(0, 120)}"`, a.riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH", a.id);
      }
    } else if (alert.type === "COMPETITOR_ACTIVITY") {
      for (const a of articles.filter((x) => x.competitorId)) {
        await raise(alert.id, `Competitor mentioned in the news`, `"${a.title.slice(0, 120)}"`, "MEDIUM", a.id);
      }
    } else if (alert.type === "PUBLICATION") {
      const pubs: string[] = (condition.publications ?? []).map((p: string) => p.toLowerCase());
      for (const a of articles.filter((x) => x.publication && pubs.includes(x.publication.toLowerCase()))) {
        await raise(alert.id, `New coverage in ${a.publication}`, `"${a.title.slice(0, 120)}"`, "LOW", a.id);
      }
    } else if (alert.type === "BREAKING_NEWS") {
      for (const a of articles.filter((x) => x.riskLevel === "HIGH" || x.riskLevel === "CRITICAL")) {
        await raise(alert.id, `Breaking / high-risk coverage`, `"${a.title.slice(0, 120)}"`, a.riskLevel, a.id);
      }
    } else if (alert.type === "KEYWORD_SPIKE") {
      const threshold = condition.threshold ?? 5;
      for (const [kwId, count] of keywordCounts.entries()) {
        if (count >= threshold) {
          const kw = keywords.find((k) => k.id === kwId);
          await raise(alert.id, `Keyword spike: ${kw?.term ?? "keyword"}`, `${count} new mentions this cycle`, "HIGH");
        }
      }
    }
  }

  return triggered;
}
