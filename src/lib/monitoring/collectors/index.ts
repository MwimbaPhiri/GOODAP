import type { Collector } from "../types";
import { RssCollector } from "./rss";
import { GoogleNewsCollector } from "./google-news";
import { WebsiteScraper } from "./scraper";

/**
 * Collector registry. Adding a new ingestion channel (Twitter/X, TV captions,
 * radio transcripts, a paid news API, ...) is as simple as implementing the
 * `Collector` interface and registering it here.
 */
const registry = new Map<string, Collector>();

function register(collector: Collector) {
  registry.set(collector.type, collector);
}

register(new RssCollector());
register(new GoogleNewsCollector());
register(new WebsiteScraper());

export function getCollector(type: string): Collector | undefined {
  return registry.get(type);
}

export function listCollectors(): string[] {
  return [...registry.keys()];
}
