import { db } from "@/lib/db";
import { chatComplete, isAIConfigured } from "@/lib/ai/client";
import { summarize } from "@/lib/analysis";

export interface ReportData {
  title: string;
  type: string;
  period: { start: string; end: string; days: number };
  generatedAt: string;
  executiveSummary: string;
  aiCommentary: string;
  totals: { total: number; positive: number; neutral: number; negative: number; netSentiment: number; totalReach: number; highRisk: number };
  sentimentTrend: { date: string; positive: number; neutral: number; negative: number }[];
  topPublications: { name: string; count: number; reach: number }[];
  topJournalists: { name: string; count: number }[];
  topTopics: { topic: string; count: number }[];
  recommendations: string[];
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseTopics(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function generateReport(
  organizationId: string,
  opts: { title: string; type: string; periodDays: number }
): Promise<ReportData> {
  const end = new Date();
  const start = new Date(end.getTime() - opts.periodDays * 86_400_000);

  const articles = await db.article.findMany({
    where: { organizationId, publishedAt: { gte: start, lte: end } },
    select: {
      title: true, author: true, publication: true, sentiment: true, sentimentScore: true,
      riskLevel: true, reach: true, topics: true, excerpt: true, publishedAt: true,
    },
  });

  const positive = articles.filter((a) => a.sentiment === "POSITIVE").length;
  const negative = articles.filter((a) => a.sentiment === "NEGATIVE").length;
  const neutral = articles.filter((a) => a.sentiment === "NEUTRAL").length;
  const total = articles.length;
  const totalReach = articles.reduce((acc, a) => acc + (a.reach ?? 0), 0);
  const highRisk = articles.filter((a) => a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL").length;
  const netSentiment = total ? Number((((positive - negative) / total) * 100).toFixed(1)) : 0;

  // Trend buckets.
  const trendMap = new Map<string, { positive: number; neutral: number; negative: number }>();
  for (let i = Math.min(opts.periodDays, 30) - 1; i >= 0; i--) {
    trendMap.set(dayKey(new Date(end.getTime() - i * 86_400_000)), { positive: 0, neutral: 0, negative: 0 });
  }
  for (const a of articles) {
    if (!a.publishedAt) continue;
    const k = dayKey(a.publishedAt);
    const t = trendMap.get(k);
    if (t) {
      if (a.sentiment === "POSITIVE") t.positive++;
      else if (a.sentiment === "NEGATIVE") t.negative++;
      else t.neutral++;
    }
  }

  const pubMap = new Map<string, { count: number; reach: number }>();
  const authorMap = new Map<string, number>();
  const topicMap = new Map<string, number>();
  for (const a of articles) {
    const pub = a.publication || "Unknown";
    const p = pubMap.get(pub) ?? { count: 0, reach: 0 };
    p.count++;
    p.reach += a.reach ?? 0;
    pubMap.set(pub, p);
    if (a.author) authorMap.set(a.author, (authorMap.get(a.author) ?? 0) + 1);
    for (const t of parseTopics(a.topics)) topicMap.set(t, (topicMap.get(t) ?? 0) + 1);
  }

  const topPublications = [...pubMap.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 10);
  const topJournalists = [...authorMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  const topTopics = [...topicMap.entries()].map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const executiveSummary =
    `During this ${opts.periodDays}-day period, ${total} media mentions were captured with an estimated total reach of ${totalReach.toLocaleString()}. ` +
    `Sentiment was ${netSentiment >= 0 ? "net positive" : "net negative"} (${netSentiment}), with ${positive} positive, ${neutral} neutral and ${negative} negative items. ` +
    `${highRisk} mention(s) were flagged as high or critical risk. ${topPublications[0] ? `${topPublications[0].name} was the most active outlet.` : ""}`;

  const recommendations = buildRecommendations({ netSentiment, highRisk, topTopics, topPublications });

  let aiCommentary = summarize(articles.map((a) => a.excerpt || a.title).join(" "), 4) ||
    "Coverage is broadly aligned with organizational messaging. Continue monitoring and engage proactively with top outlets.";

  if (isAIConfigured()) {
    try {
      aiCommentary = await chatComplete(
        [
          { role: "system", content: "You are a senior PR strategist writing the commentary section of a media report. Be concise, executive and specific." },
          { role: "user", content: `Write a 4-6 sentence commentary. Data: ${total} mentions, net sentiment ${netSentiment}, ${highRisk} high-risk items, top outlets: ${topPublications.slice(0, 3).map((p) => p.name).join(", ")}, top topics: ${topTopics.slice(0, 3).map((t) => t.topic).join(", ")}.` },
        ],
        { temperature: 0.4, maxTokens: 400 }
      );
    } catch {
      /* keep heuristic commentary */
    }
  }

  return {
    title: opts.title,
    type: opts.type,
    period: { start: start.toISOString(), end: end.toISOString(), days: opts.periodDays },
    generatedAt: new Date().toISOString(),
    executiveSummary,
    aiCommentary,
    totals: { total, positive, neutral, negative, netSentiment, totalReach, highRisk },
    sentimentTrend: [...trendMap.entries()].map(([date, v]) => ({ date, ...v })),
    topPublications,
    topJournalists,
    topTopics,
    recommendations,
  };
}

function buildRecommendations(input: {
  netSentiment: number;
  highRisk: number;
  topTopics: { topic: string; count: number }[];
  topPublications: { name: string; count: number }[];
}): string[] {
  const recs: string[] = [];
  if (input.netSentiment < 0) recs.push("Deploy reactive communications to address negative narratives and rebuild trust.");
  else recs.push("Amplify positive coverage through owned and social channels to sustain momentum.");
  if (input.highRisk > 0) recs.push(`Prioritize the ${input.highRisk} high/critical-risk item(s) with a prepared holding statement and spokesperson.`);
  if (input.topTopics[0]) recs.push(`Develop thought-leadership content around “${input.topTopics[0].topic}”, the most-covered topic.`);
  if (input.topPublications[0]) recs.push(`Strengthen relationships with ${input.topPublications[0].name} and other high-frequency outlets.`);
  recs.push("Schedule a weekly review of sentiment trends and competitor share of voice.");
  return recs;
}
