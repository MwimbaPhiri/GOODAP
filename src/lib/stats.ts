import { db } from "@/lib/db";

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function parseTopics(json?: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export interface DashboardStats {
  totals: {
    total: number;
    today: number;
    positive: number;
    neutral: number;
    negative: number;
    deltaTotal: number;
    deltaToday: number;
    netSentiment: number;
    highRisk: number;
  };
  sentimentTrend: { date: string; positive: number; neutral: number; negative: number }[];
  coverageTimeline: { date: string; mentions: number }[];
  topSources: { name: string; count: number; sentiment: number }[];
  keywordPerformance: { term: string; mentions: number; sentiment: number; priority: string }[];
  trendingTopics: { topic: string; count: number }[];
  competitorComparison: { name: string; mentions: number; shareOfVoice: number; netSentiment: number }[];
  recentAlerts: { id: string; title: string; message: string | null; severity: string; createdAt: string }[];
  recentArticles: {
    id: string; title: string; publication: string | null; sentiment: string | null;
    riskLevel: string | null; url: string; publishedAt: string | null;
  }[];
}

export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  const today = startOfDay();
  const last30 = daysAgo(30);
  const prev30Start = daysAgo(60);

  const [total, todayCount, positive, neutral, negative, highRisk, prevTotal, prevToday] = await Promise.all([
    db.article.count({ where: { organizationId } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: today } } }),
    db.article.count({ where: { organizationId, sentiment: "POSITIVE" } }),
    db.article.count({ where: { organizationId, sentiment: "NEUTRAL" } }),
    db.article.count({ where: { organizationId, sentiment: "NEGATIVE" } }),
    db.article.count({ where: { organizationId, riskLevel: { in: ["HIGH", "CRITICAL"] } } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: prev30Start, lt: last30 } } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: daysAgo(2), lt: today } } }),
  ]);

  // Window of articles for in-memory bucketing (dashboard-scale).
  const windowArticles = await db.article.findMany({
    where: { organizationId, publishedAt: { gte: last30 } },
    select: {
      publishedAt: true, sentiment: true, sentimentScore: true, publication: true,
      topics: true, competitorId: true,
    },
  });

  // Sentiment trend + coverage timeline (last 14 / 30 days).
  const trendMap = new Map<string, { positive: number; neutral: number; negative: number }>();
  const timelineMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const key = startOfDay(daysAgo(i)).toISOString().slice(0, 10);
    trendMap.set(key, { positive: 0, neutral: 0, negative: 0 });
  }
  for (let i = 29; i >= 0; i--) {
    timelineMap.set(startOfDay(daysAgo(i)).toISOString().slice(0, 10), 0);
  }

  for (const a of windowArticles) {
    if (!a.publishedAt) continue;
    const key = startOfDay(a.publishedAt).toISOString().slice(0, 10);
    if (timelineMap.has(key)) timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1);
    const t = trendMap.get(key);
    if (t) {
      if (a.sentiment === "POSITIVE") t.positive++;
      else if (a.sentiment === "NEGATIVE") t.negative++;
      else t.neutral++;
    }
  }

  const sentimentTrend = [...trendMap.entries()].map(([date, v]) => ({ date, ...v }));
  const coverageTimeline = [...timelineMap.entries()].map(([date, mentions]) => ({ date, mentions }));

  // Top sources.
  const sourceAgg = new Map<string, { count: number; scoreSum: number }>();
  for (const a of windowArticles) {
    const name = a.publication || "Unknown";
    const cur = sourceAgg.get(name) ?? { count: 0, scoreSum: 0 };
    cur.count++;
    cur.scoreSum += a.sentimentScore ?? 0;
    sourceAgg.set(name, cur);
  }
  const topSources = [...sourceAgg.entries()]
    .map(([name, v]) => ({ name, count: v.count, sentiment: Number((v.scoreSum / v.count).toFixed(2)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Trending topics.
  const topicAgg = new Map<string, number>();
  for (const a of windowArticles) {
    for (const t of parseTopics(a.topics)) topicAgg.set(t, (topicAgg.get(t) ?? 0) + 1);
  }
  const trendingTopics = [...topicAgg.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Keyword performance.
  const keywords = await db.keyword.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: { _count: { select: { matches: true } }, matches: { include: { article: { select: { sentimentScore: true } } } } },
    take: 8,
  });
  const keywordPerformance = keywords
    .map((k) => {
      const scores = k.matches.map((m) => m.article.sentimentScore ?? 0);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { term: k.term, mentions: k._count.matches, sentiment: Number(avg.toFixed(2)), priority: k.priority };
    })
    .sort((a, b) => b.mentions - a.mentions);

  // Competitor comparison (share of voice = share of total org + competitor mentions).
  const competitors = await db.competitor.findMany({ where: { organizationId } });
  const ownMentions = windowArticles.filter((a) => !a.competitorId).length;
  const compData = await Promise.all(
    competitors.map(async (c) => {
      const arr = windowArticles.filter((a) => a.competitorId === c.id);
      const scoreSum = arr.reduce((acc, a) => acc + (a.sentimentScore ?? 0), 0);
      return { name: c.name, mentions: arr.length, netSentiment: arr.length ? Number((scoreSum / arr.length).toFixed(2)) : 0 };
    })
  );
  const totalVoice = ownMentions + compData.reduce((acc, c) => acc + c.mentions, 0) || 1;
  const ownNetSum = windowArticles.filter((a) => !a.competitorId).reduce((acc, a) => acc + (a.sentimentScore ?? 0), 0);
  const competitorComparison = [
    { name: "Your brand", mentions: ownMentions, shareOfVoice: Number(((ownMentions / totalVoice) * 100).toFixed(1)), netSentiment: ownMentions ? Number((ownNetSum / ownMentions).toFixed(2)) : 0 },
    ...compData.map((c) => ({ ...c, shareOfVoice: Number(((c.mentions / totalVoice) * 100).toFixed(1)) })),
  ].sort((a, b) => b.mentions - a.mentions);

  const [recentAlertsRaw, recentArticlesRaw] = await Promise.all([
    db.alertEvent.findMany({
      where: { alert: { organizationId } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.article.findMany({
      where: { organizationId },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: { id: true, title: true, publication: true, sentiment: true, riskLevel: true, url: true, publishedAt: true },
    }),
  ]);

  return {
    totals: {
      total,
      today: todayCount,
      positive,
      neutral,
      negative,
      deltaTotal: pctDelta(windowArticles.length, prevTotal),
      deltaToday: pctDelta(todayCount, prevToday),
      netSentiment: total ? Number((((positive - negative) / total) * 100).toFixed(1)) : 0,
      highRisk,
    },
    sentimentTrend,
    coverageTimeline,
    topSources,
    keywordPerformance,
    trendingTopics,
    competitorComparison,
    recentAlerts: recentAlertsRaw.map((a) => ({
      id: a.id, title: a.title, message: a.message, severity: a.severity, createdAt: a.createdAt.toISOString(),
    })),
    recentArticles: recentArticlesRaw.map((a) => ({
      id: a.id, title: a.title, publication: a.publication, sentiment: a.sentiment,
      riskLevel: a.riskLevel, url: a.url, publishedAt: a.publishedAt?.toISOString() ?? null,
    })),
  };
}
