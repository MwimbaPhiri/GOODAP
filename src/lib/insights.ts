import type { DashboardStats } from "@/lib/stats";

export interface Insight {
  tone: "positive" | "neutral" | "warning";
  text: string;
}

/** Deterministic executive insights derived from dashboard statistics. */
export function generateInsights(stats: DashboardStats): Insight[] {
  const out: Insight[] = [];
  const { totals, competitorComparison, trendingTopics, topSources } = stats;

  if (totals.deltaTotal >= 0) {
    out.push({ tone: "positive", text: `Coverage volume is up ${totals.deltaTotal}% versus the previous period, indicating growing media attention.` });
  } else {
    out.push({ tone: "warning", text: `Coverage volume is down ${Math.abs(totals.deltaTotal)}% versus the previous period — consider proactive outreach.` });
  }

  if (totals.netSentiment >= 20) {
    out.push({ tone: "positive", text: `Net sentiment is strongly positive (+${totals.netSentiment}). Your messaging is resonating well.` });
  } else if (totals.netSentiment < 0) {
    out.push({ tone: "warning", text: `Net sentiment is negative (${totals.netSentiment}). Prepare reactive communications and monitor closely.` });
  } else {
    out.push({ tone: "neutral", text: `Net sentiment is balanced (+${totals.netSentiment}). There is an opportunity to shift the narrative more positively.` });
  }

  if (totals.highRisk > 0) {
    out.push({ tone: "warning", text: `${totals.highRisk} high/critical-risk mention(s) detected. Review the alerts feed and consider a holding statement.` });
  }

  const topComp = competitorComparison.find((c) => c.name !== "Your brand");
  const own = competitorComparison.find((c) => c.name === "Your brand");
  if (topComp && own && topComp.shareOfVoice > own.shareOfVoice) {
    out.push({ tone: "warning", text: `${topComp.name} is leading share of voice (${topComp.shareOfVoice}% vs your ${own.shareOfVoice}%). Increase earned-media activity.` });
  } else if (own) {
    out.push({ tone: "positive", text: `You lead share of voice at ${own.shareOfVoice}% among tracked competitors.` });
  }

  if (trendingTopics[0]) {
    out.push({ tone: "neutral", text: `“${trendingTopics[0].topic}” is the most-covered topic right now — align upcoming content accordingly.` });
  }
  if (topSources[0]) {
    out.push({ tone: "neutral", text: `${topSources[0].name} is your most active outlet with ${topSources[0].count} mentions this period.` });
  }

  return out.slice(0, 5);
}
