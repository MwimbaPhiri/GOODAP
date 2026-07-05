import Parser from "rss-parser";
import type { Collector, CollectedItem, CollectorContext } from "../types";

const parser = new Parser({
  timeout: 15_000,
  headers: { "User-Agent": "MediaPulseAI/1.0 (+https://mediapulse.ai)" },
});

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Collects articles from any standard RSS/Atom feed. */
export class RssCollector implements Collector {
  readonly type = "RSS";

  async collect(sourceUrl: string, ctx: CollectorContext): Promise<CollectedItem[]> {
    const feed = await parser.parseURL(sourceUrl);
    const limit = ctx.limit ?? 25;

    return (feed.items ?? []).slice(0, limit).map((item) => {
      const content = stripHtml(item.contentSnippet || item.content || (item as any)["content:encoded"]);
      return {
        title: item.title?.trim() || "Untitled",
        url: item.link || sourceUrl,
        author: item.creator || (item as any).author || null,
        publication: feed.title || null,
        content,
        excerpt: content.slice(0, 280),
        imageUrl: (item.enclosure?.url as string) || (item as any)["media:content"]?.$?.url || null,
        publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
      };
    });
  }
}
