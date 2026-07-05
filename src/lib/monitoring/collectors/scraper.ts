import * as cheerio from "cheerio";
import type { Collector, CollectedItem, CollectorContext } from "../types";

/**
 * Generic website scraper. Fetches a page and extracts article metadata using
 * Open Graph tags, JSON-LD and common article selectors. Designed as a base for
 * site-specific scrapers that can be registered later.
 */
export class WebsiteScraper implements Collector {
  readonly type = "SCRAPER";

  async collect(sourceUrl: string, _ctx: CollectorContext): Promise<CollectedItem[]> {
    const res = await fetch(sourceUrl, {
      headers: { "User-Agent": "MediaPulseAI/1.0 (+https://mediapulse.ai)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const meta = (name: string) =>
      $(`meta[property='${name}']`).attr("content") || $(`meta[name='${name}']`).attr("content") || null;

    const title = meta("og:title") || $("title").first().text().trim() || "Untitled";
    const image = meta("og:image");
    const publication = meta("og:site_name");
    const author = meta("author") || meta("article:author");
    const published = meta("article:published_time");

    const paragraphs = $("article p, main p, .article-body p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((t) => t.length > 40);
    const content = (paragraphs.join(" ") || meta("og:description") || "").replace(/\s+/g, " ").trim();

    return [
      {
        title,
        url: meta("og:url") || sourceUrl,
        author,
        publication,
        content,
        excerpt: content.slice(0, 280),
        imageUrl: image,
        publishedAt: published ? new Date(published) : null,
      },
    ];
  }
}
