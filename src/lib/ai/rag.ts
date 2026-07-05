import { db } from "@/lib/db";
import { chatComplete, isAIConfigured, type ChatMessage } from "./client";
import { summarize } from "@/lib/analysis";

export interface RetrievedDoc {
  id: string;
  title: string;
  publication: string | null;
  sentiment: string | null;
  url: string;
  snippet: string;
  publishedAt: Date | null;
  score: number;
}

const STOP = new Set(["the", "and", "for", "our", "why", "what", "who", "how", "are", "is", "a", "of", "to", "in", "us", "we"]);

function terms(query: string): string[] {
  return (query.toLowerCase().match(/[a-z0-9]+/g) || []).filter((t) => t.length > 2 && !STOP.has(t));
}

/** Keyword-based retrieval over the org's collected articles (BM25-lite). */
export async function retrieve(organizationId: string, query: string, limit = 6): Promise<RetrievedDoc[]> {
  const qTerms = terms(query);
  // Pull a recent candidate window, then score in memory. For production scale
  // this is where a pgvector / full-text index would plug in.
  const candidates = await db.article.findMany({
    where: { organizationId },
    orderBy: { publishedAt: "desc" },
    take: 300,
    select: {
      id: true, title: true, publication: true, sentiment: true, url: true,
      excerpt: true, content: true, topics: true, publishedAt: true,
    },
  });

  const scored = candidates.map((a) => {
    const haystack = `${a.title} ${a.excerpt ?? ""} ${a.topics ?? ""}`.toLowerCase();
    let score = 0;
    for (const t of qTerms) {
      if (haystack.includes(t)) score += haystack.split(t).length - 1;
    }
    // Recency boost.
    if (a.publishedAt) {
      const ageDays = (Date.now() - a.publishedAt.getTime()) / 86_400_000;
      score += Math.max(0, 3 - ageDays / 3);
    }
    return { a, score };
  });

  const top = scored
    .filter((s) => s.score > 0 || qTerms.length === 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);

  return top.map(({ a, score }) => ({
    id: a.id,
    title: a.title,
    publication: a.publication,
    sentiment: a.sentiment,
    url: a.url,
    snippet: (a.excerpt || a.content || "").slice(0, 400),
    publishedAt: a.publishedAt,
    score,
  }));
}

async function orgStats(organizationId: string) {
  const since = new Date(Date.now() - 7 * 86_400_000);
  const [total, positive, negative, neutral, highRisk] = await Promise.all([
    db.article.count({ where: { organizationId, publishedAt: { gte: since } } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: since }, sentiment: "POSITIVE" } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: since }, sentiment: "NEGATIVE" } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: since }, sentiment: "NEUTRAL" } }),
    db.article.count({ where: { organizationId, publishedAt: { gte: since }, riskLevel: { in: ["HIGH", "CRITICAL"] } } }),
  ]);
  return { total, positive, negative, neutral, highRisk };
}

export interface AnswerResult {
  answer: string;
  citations: RetrievedDoc[];
  usedAI: boolean;
}

const SYSTEM_PROMPT = `You are MediaPulse AI, an expert PR and media-monitoring analyst.
Answer the user's question using ONLY the provided media context and statistics.
Be concise, professional and actionable. When you cite coverage, reference the
publication. If the context is insufficient, say so and suggest what to monitor.`;

/** Answer a question with RAG. Falls back to a deterministic summary offline. */
export async function answer(
  organizationId: string,
  question: string,
  history: ChatMessage[] = []
): Promise<AnswerResult> {
  const [docs, stats] = await Promise.all([retrieve(organizationId, question, 6), orgStats(organizationId)]);

  const context = docs
    .map((d, i) => `[${i + 1}] ${d.title} — ${d.publication ?? "Unknown"} (${d.sentiment ?? "n/a"})\n${d.snippet}`)
    .join("\n\n");

  const statsLine = `Last 7 days: ${stats.total} mentions (${stats.positive} positive, ${stats.neutral} neutral, ${stats.negative} negative, ${stats.highRisk} high-risk).`;

  if (isAIConfigured()) {
    try {
      const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-6),
        {
          role: "user",
          content: `Statistics:\n${statsLine}\n\nMedia context:\n${context || "(no matching coverage)"}\n\nQuestion: ${question}`,
        },
      ];
      const text = await chatComplete(messages, { temperature: 0.3, maxTokens: 900 });
      return { answer: text.trim(), citations: docs, usedAI: true };
    } catch (err) {
      console.error("[ai] falling back to heuristic answer:", err);
    }
  }

  return { answer: heuristicAnswer(question, docs, stats, statsLine), citations: docs, usedAI: false };
}

function heuristicAnswer(
  question: string,
  docs: RetrievedDoc[],
  stats: { total: number; positive: number; negative: number; neutral: number; highRisk: number },
  statsLine: string
): string {
  const q = question.toLowerCase();

  if (docs.length === 0) {
    return `I couldn't find recent coverage matching that query. ${statsLine} Try broadening your keywords or connecting more sources under Sources.`;
  }

  const bullets = docs.slice(0, 5).map((d) => `- ${d.title} (${d.publication ?? "Unknown"}, ${d.sentiment ?? "n/a"})`).join("\n");
  const combined = docs.map((d) => d.snippet).join(" ");
  const gist = summarize(combined, 3);

  if (q.includes("negative") || q.includes("risk") || q.includes("crisis")) {
    const negatives = docs.filter((d) => d.sentiment === "NEGATIVE");
    return `${statsLine}\n\nThere ${negatives.length === 1 ? "is" : "are"} ${negatives.length} negative item(s) in the top matches, and ${stats.highRisk} high-risk mention(s) this week. Key drivers:\n${bullets}\n\nRecommended action: prepare a holding statement and monitor the highest-risk outlets closely.`;
  }
  if (q.includes("trend") || q.includes("topic")) {
    return `${statsLine}\n\nTop coverage right now:\n${bullets}\n\nSummary: ${gist}`;
  }
  if (q.includes("report") || q.includes("summar")) {
    return `Here is a summary of today's coverage.\n\n${statsLine}\n\n${gist}\n\nMost notable items:\n${bullets}`;
  }

  return `${statsLine}\n\n${gist}\n\nRelevant coverage:\n${bullets}`;
}
