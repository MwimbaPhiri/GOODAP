/**
 * Deterministic media-analysis engine.
 *
 * Provides lexicon-based sentiment, topic/entity extraction, risk scoring and
 * templated summaries. It is used to analyze every collected article and as the
 * offline fallback for the AI features. When an OpenAI key is configured,
 * `@/lib/analysis/ai` layers richer LLM output on top of these signals.
 */

import type { Sentiment, RiskLevel } from "@/lib/constants";

const POSITIVE_WORDS = [
  "growth", "record", "success", "award", "innovative", "leading", "profit", "surge",
  "breakthrough", "praise", "win", "wins", "strong", "expansion", "milestone", "gains",
  "boost", "celebrated", "trust", "positive", "outperform", "acclaimed", "partnership",
  "launch", "launches", "excellent", "impressive", "top", "best", "improved", "recovery",
  "sustainable", "leadership", "loyalty", "popular", "thriving",
];

const NEGATIVE_WORDS = [
  "loss", "losses", "lawsuit", "scandal", "decline", "drop", "layoffs", "fraud", "breach",
  "outage", "recall", "crisis", "controversy", "criticism", "fine", "fined", "investigation",
  "backlash", "concern", "concerns", "fail", "failure", "poor", "weak", "delay", "shortage",
  "complaint", "complaints", "risk", "risks", "warning", "downgrade", "protest", "boycott",
  "allegation", "allegations", "hack", "leak", "plunge", "slump", "controversial",
];

const TOPIC_LEXICON: Record<string, string[]> = {
  Finance: ["revenue", "profit", "earnings", "quarter", "stock", "shares", "investment", "funding", "ipo", "valuation"],
  Product: ["launch", "feature", "product", "release", "update", "app", "device", "platform", "version"],
  Leadership: ["ceo", "executive", "chairman", "founder", "board", "appointed", "resign", "leadership"],
  Sustainability: ["sustainability", "carbon", "climate", "renewable", "green", "esg", "emissions"],
  "Legal & Regulatory": ["lawsuit", "regulation", "compliance", "court", "settlement", "antitrust", "gdpr", "fine"],
  Technology: ["ai", "cloud", "software", "cyber", "data", "innovation", "digital", "algorithm"],
  Marketing: ["campaign", "brand", "advertising", "sponsorship", "partnership", "launch event"],
  "Crisis & Risk": ["recall", "breach", "outage", "scandal", "crisis", "layoffs", "hack", "protest"],
  Market: ["market", "competitor", "share", "industry", "demand", "customers", "expansion"],
};

const STOPWORDS = new Set([
  "the", "and", "for", "are", "was", "with", "that", "this", "from", "has", "have", "will",
  "its", "their", "they", "you", "our", "but", "not", "all", "can", "his", "her", "she",
  "him", "who", "what", "when", "where", "which", "than", "then", "them", "into", "over",
  "after", "more", "also", "been", "were", "would", "could", "about", "said", "says",
]);

export interface SentimentResult {
  sentiment: Sentiment;
  score: number; // -1..1
  confidence: number; // 0..1
}

export function analyzeSentiment(text: string): SentimentResult {
  const words = tokenize(text);
  if (words.length === 0) return { sentiment: "NEUTRAL", score: 0, confidence: 0.3 };

  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.includes(w)) pos++;
    if (NEGATIVE_WORDS.includes(w)) neg++;
  }

  const total = pos + neg;
  const raw = total === 0 ? 0 : (pos - neg) / total;
  // Dampen by how much sentiment-bearing signal we found.
  const density = Math.min(1, total / Math.max(8, words.length / 20));
  const score = Number((raw * density).toFixed(3));

  let sentiment: Sentiment = "NEUTRAL";
  if (score > 0.12) sentiment = "POSITIVE";
  else if (score < -0.12) sentiment = "NEGATIVE";

  const confidence = Number(Math.min(0.98, 0.45 + density * 0.5).toFixed(3));
  return { sentiment, score, confidence };
}

export function extractTopics(text: string, max = 4): string[] {
  const lower = text.toLowerCase();
  const scored: { topic: string; hits: number }[] = [];
  for (const [topic, terms] of Object.entries(TOPIC_LEXICON)) {
    const hits = terms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
    if (hits > 0) scored.push({ topic, hits });
  }
  scored.sort((a, b) => b.hits - a.hits);
  const topics = scored.slice(0, max).map((s) => s.topic);
  return topics.length ? topics : ["General"];
}

export interface ExtractedEntity {
  name: string;
  type: "PERSON" | "ORG" | "EXECUTIVE" | "LOCATION" | "PRODUCT" | "MISC";
  salience: number;
}

/** Naive capitalized-phrase entity extractor with frequency-based salience. */
export function extractEntities(text: string, max = 8): ExtractedEntity[] {
  const matches = text.match(/\b([A-Z][a-zA-Z0-9&.'-]+(?:\s+[A-Z][a-zA-Z0-9&.'-]+){0,3})\b/g) || [];
  const counts = new Map<string, number>();
  for (const m of matches) {
    const clean = m.trim();
    if (clean.length < 3) continue;
    if (STOPWORDS.has(clean.toLowerCase())) continue;
    counts.set(clean, (counts.get(clean) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max);
  const maxCount = sorted[0]?.[1] ?? 1;
  const execHints = ["CEO", "Chief", "President", "Director", "Founder", "Chairman"];
  return sorted.map(([name, count]) => ({
    name,
    type: guessEntityType(name, text, execHints),
    salience: Number((count / maxCount).toFixed(2)),
  }));
}

function guessEntityType(name: string, text: string, execHints: string[]): ExtractedEntity["type"] {
  const idx = text.indexOf(name);
  const context = idx >= 0 ? text.slice(Math.max(0, idx - 40), idx + name.length + 40) : "";
  if (execHints.some((h) => context.includes(h))) return "EXECUTIVE";
  if (/\b(Inc|Corp|Ltd|LLC|Group|Holdings|Technologies|Systems|Bank)\b/.test(name)) return "ORG";
  if (name.split(" ").length === 2 && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name)) return "PERSON";
  return "MISC";
}

export function classifyRisk(sentiment: Sentiment, score: number, text: string): RiskLevel {
  const lower = text.toLowerCase();
  const crisisTerms = ["breach", "lawsuit", "recall", "scandal", "fraud", "crisis", "hack", "layoffs", "investigation"];
  const crisisHits = crisisTerms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);

  if (sentiment === "NEGATIVE" && (crisisHits >= 2 || score < -0.5)) return "CRITICAL";
  if (sentiment === "NEGATIVE" && (crisisHits >= 1 || score < -0.3)) return "HIGH";
  if (sentiment === "NEGATIVE") return "MEDIUM";
  if (crisisHits >= 1) return "MEDIUM";
  return "LOW";
}

export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function categorize(topics: string[]): string {
  return topics[0] ?? "General";
}

/** Extractive summary: pick the most representative sentences. */
export function summarize(text: string, maxSentences = 3): string {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(" ").trim();

  const freq = new Map<string, number>();
  for (const w of tokenize(text)) {
    if (STOPWORDS.has(w) || w.length < 4) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const scored = sentences.map((s, i) => {
    const score = tokenize(s).reduce((acc, w) => acc + (freq.get(w) ?? 0), 0) / Math.max(1, tokenize(s).length);
    return { s, i, score };
  });
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, maxSentences);
  top.sort((a, b) => a.i - b.i);
  return top.map((t) => t.s.trim()).join(" ");
}

export function suggestPrResponse(title: string, sentiment: Sentiment): string {
  if (sentiment === "NEGATIVE") {
    return `We are aware of the reporting regarding "${title.slice(0, 80)}" and take these concerns seriously. Our team is reviewing the details and remains committed to transparency. We will share a full update as soon as we have verified the facts.`;
  }
  if (sentiment === "POSITIVE") {
    return `We're delighted by the coverage of "${title.slice(0, 80)}". This milestone reflects the dedication of our team and the trust of our customers, and we look forward to building on this momentum.`;
  }
  return `Thank you for the coverage of "${title.slice(0, 80)}". We're happy to provide additional context or an interview with a spokesperson on request.`;
}

export function suggestSocialPost(title: string, sentiment: Sentiment): string {
  if (sentiment === "NEGATIVE") {
    return `We hear the conversation around recent reports and want you to know we're listening. Your trust matters — more soon. 🧵`;
  }
  if (sentiment === "POSITIVE") {
    return `Big moment for our team! 🎉 "${title.slice(0, 90)}" — grateful for the support. #news #media`;
  }
  return `In the news today: "${title.slice(0, 100)}". Read more and let us know your thoughts. 👇`;
}

export interface ArticleAnalysis {
  sentiment: Sentiment;
  sentimentScore: number;
  confidence: number;
  topics: string[];
  entities: ExtractedEntity[];
  riskLevel: RiskLevel;
  category: string;
  readingTime: number;
  aiSummary: string;
  suggestedPr: string;
  suggestedPost: string;
}

/** Full deterministic analysis of one article. */
export function analyzeArticle(input: { title: string; content?: string | null }): ArticleAnalysis {
  const text = `${input.title}. ${input.content ?? ""}`.trim();
  const { sentiment, score, confidence } = analyzeSentiment(text);
  const topics = extractTopics(text);
  const entities = extractEntities(text);
  const riskLevel = classifyRisk(sentiment, score, text);
  return {
    sentiment,
    sentimentScore: score,
    confidence,
    topics,
    entities,
    riskLevel,
    category: categorize(topics),
    readingTime: estimateReadingTime(text),
    aiSummary: summarize(text),
    suggestedPr: suggestPrResponse(input.title, sentiment),
    suggestedPost: suggestSocialPost(input.title, sentiment),
  };
}

// --- helpers ---

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter((w) => w.length > 1);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
