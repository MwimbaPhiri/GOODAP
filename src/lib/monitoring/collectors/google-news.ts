import Parser from "rss-parser";
import type { Collector, CollectedItem, CollectorContext } from "../types";

const parser = new Parser({
  timeout: 15_000,
  headers: { "User-Agent": "MediaPulseAI/1.0 (+https://mediapulse.ai)" },
});

/**
 * Collects from Google News' public RSS interface. The `sourceUrl` may be a
 * language/region hint (e.g. "en-US") or a full Google News RSS URL; keyword
 * terms from the context are turned into the search query.
 */
export class GoogleNewsCollector implements Collector {
  readonly type = "GOOGLE_NEWS";

  private buildUrl(sourceUrl: string, terms?: string[]): string {
    if (sourceUrl.startsWith("http")) return sourceUrl;
    const query = encodeURIComponent((terms && terms.length ? terms.join(" OR ") : "news"));
    const [hl = "en-US"] = sourceUrl.split(":");
    const gl = hl.split("-")[1] || "US";
    return `https://news.google.com/rss/search?q=${query}&hl=${hl}&gl=${gl}&ceid=${gl}:${hl.split("-")[0]}`;
  }

  async collect(sourceUrl: string, ctx: CollectorContext): Promise<CollectedItem[]> {
    const url = this.buildUrl(sourceUrl, ctx.terms);
    const feed = await parser.parseURL(url);
    const limit = ctx.limit ?? 25;

    return (feed.items ?? []).slice(0, limit).map((item) => {
      // Google News prefixes titles with the source name after a dash.
      const rawTitle = item.title?.trim() || "Untitled";
      const dashIdx = rawTitle.lastIndexOf(" - ");
      const title = dashIdx > 20 ? rawTitle.slice(0, dashIdx) : rawTitle;
      const publication = dashIdx > 20 ? rawTitle.slice(dashIdx + 3) : "Google News";
      const content = (item.contentSnippet || "").replace(/\s+/g, " ").trim();
      return {
        title,
        url: item.link || url,
        author: null,
        publication,
        content,
        excerpt: content.slice(0, 280),
        imageUrl: null,
        publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
      };
    });
  }
}
