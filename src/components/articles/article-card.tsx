import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SentimentBadge, RiskBadge } from "@/components/shared/badges";
import { Badge } from "@/components/ui/badge";

export interface ArticleListItem {
  id: string;
  title: string;
  author: string | null;
  publication: string | null;
  url: string;
  excerpt: string | null;
  sentiment: string | null;
  riskLevel: string | null;
  category: string | null;
  readingTime: number | null;
  topics: string[];
  country: string | null;
  publishedAt: string | null;
}

export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <div className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <SentimentBadge sentiment={article.sentiment} />
            <RiskBadge risk={article.riskLevel} />
            {article.category && <Badge variant="outline" className="text-[11px]">{article.category}</Badge>}
          </div>
          <Link href={`/articles/${article.id}`}>
            <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{article.publication ?? "Unknown"}</span>
            {article.author && <span>· {article.author}</span>}
            {article.publishedAt && <span>· {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>}
            {article.readingTime && (
              <span className="flex items-center gap-1"><Clock className="size-3" /> {article.readingTime} min</span>
            )}
            <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              Source <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
