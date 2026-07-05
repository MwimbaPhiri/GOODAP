/** A normalized item produced by any collector, before persistence/analysis. */
export interface CollectedItem {
  title: string;
  url: string;
  author?: string | null;
  publication?: string | null;
  content?: string | null;
  excerpt?: string | null;
  imageUrl?: string | null;
  publishedAt?: Date | null;
  language?: string | null;
  country?: string | null;
}

export interface CollectorContext {
  /** Optional keyword terms to bias/query the collector. */
  terms?: string[];
  /** Max items to return in one run. */
  limit?: number;
}

export interface Collector {
  /** Matches Source.type in the schema. */
  readonly type: string;
  /** Fetch and normalize items from a given source url. */
  collect(sourceUrl: string, ctx: CollectorContext): Promise<CollectedItem[]>;
}
