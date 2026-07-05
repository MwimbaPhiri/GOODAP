import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Clock, Sparkles, Megaphone, MessageSquare, Gauge } from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { SentimentBadge, RiskBadge } from "@/components/shared/badges";
import { CopyButton } from "@/components/shared/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

function parse(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { org } = await requireOrg();
  const { id } = await params;
  const article = await db.article.findFirst({
    where: { id, organizationId: org.id },
    include: {
      entities: { orderBy: { salience: "desc" }, take: 12 },
      source: { select: { name: true, domainAuthority: true } },
      competitor: { select: { name: true } },
      keywords: { include: { keyword: { select: { term: true, type: true } } } },
    },
  });
  if (!article) notFound();

  const topics = parse(article.topics);

  return (
    <div>
      <Link href="/articles" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to articles
      </Link>

      <PageHeader
        title={article.title}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={article.url} target="_blank" rel="noreferrer">Open source <ExternalLink className="ml-1.5 size-3.5" /></a>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={article.sentiment} />
        <RiskBadge risk={article.riskLevel} />
        {article.category && <Badge variant="outline">{article.category}</Badge>}
        {article.competitor && <Badge variant="secondary">Competitor: {article.competitor.name}</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> AI summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{article.aiSummary || "No summary available."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed">{article.content || article.excerpt || "No content extracted."}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="size-4 text-primary" /> Suggested PR response</CardTitle>
                  {article.suggestedPr && <CopyButton text={article.suggestedPr} />}
                </div>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{article.suggestedPr}</p></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="size-4 text-primary" /> Suggested social post</CardTitle>
                  {article.suggestedPost && <CopyButton text={article.suggestedPost} />}
                </div>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{article.suggestedPost}</p></CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Detail label="Publication" value={article.publication} />
              <Detail label="Author" value={article.author} />
              <Detail label="Published" value={article.publishedAt ? format(article.publishedAt, "PPp") : null} />
              <Detail label="Country" value={article.country?.toUpperCase()} />
              <Detail label="Language" value={article.language?.toUpperCase()} />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reading time</span>
                <span className="flex items-center gap-1 font-medium"><Clock className="size-3.5" /> {article.readingTime ?? 1} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Est. reach</span>
                <span className="font-medium">{(article.reach ?? 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Gauge className="size-4" /> Analysis scores</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ScoreBar label="Sentiment" value={((article.sentimentScore ?? 0) + 1) / 2} display={(article.sentimentScore ?? 0).toFixed(2)} />
              <ScoreBar label="Confidence" value={article.confidence ?? 0} display={`${Math.round((article.confidence ?? 0) * 100)}%`} />
            </CardContent>
          </Card>

          {topics.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Topics</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {topics.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </CardContent>
            </Card>
          )}

          {article.entities.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Named entities</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {article.entities.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{e.name}</span>
                    <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {article.keywords.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Matched keywords</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {article.keywords.map((k) => (
                  <Badge key={k.id} variant="secondary">{k.keyword.term}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value ?? "—"}</span>
    </div>
  );
}

function ScoreBar({ label, value, display }: { label: string; value: number; display: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{display}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} />
      </div>
    </div>
  );
}
