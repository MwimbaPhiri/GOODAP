import Link from "next/link";
import {
  Newspaper, TrendingUp, Smile, Meh, Frown, Sparkles, AlertTriangle,
  ArrowUpRight, Radio, Tags, Flame,
} from "lucide-react";
import { requireOrg } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/stats";
import { generateInsights } from "@/lib/insights";
import { isAIConfigured } from "@/lib/ai/client";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RunCollectionButton } from "@/components/dashboard/run-collection-button";
import {
  SentimentTrendChart, CoverageTimelineChart, SentimentDonut, HorizontalBar, ShareOfVoiceChart,
} from "@/components/dashboard/charts";
import { SentimentBadge } from "@/components/shared/badges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

const toneStyles = {
  positive: "border-l-emerald-500",
  neutral: "border-l-primary",
  warning: "border-l-amber-500",
};

export default async function DashboardPage() {
  const { org } = await requireOrg();
  const stats = await getDashboardStats(org.id);
  const insights = generateInsights(stats);
  const total = stats.totals.total || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day, ${org.name}`}
        description="Your media intelligence overview for the last 30 days"
        actions={<RunCollectionButton />}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total mentions" value={stats.totals.total.toLocaleString()} delta={stats.totals.deltaTotal} icon={Newspaper} />
        <StatCard label="Today" value={stats.totals.today} delta={stats.totals.deltaToday} icon={TrendingUp} hint="vs yesterday" />
        <StatCard label="Positive" value={stats.totals.positive} icon={Smile} accent="text-emerald-500" hint={`${Math.round((stats.totals.positive / total) * 100)}% of total`} />
        <StatCard label="Neutral" value={stats.totals.neutral} icon={Meh} accent="text-zinc-400" hint={`${Math.round((stats.totals.neutral / total) * 100)}% of total`} />
        <StatCard label="Negative" value={stats.totals.negative} icon={Frown} accent="text-red-500" hint={`${Math.round((stats.totals.negative / total) * 100)}% of total`} />
      </div>

      {/* Sentiment trend + donut */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sentiment trend</CardTitle>
            <CardDescription>Positive, neutral and negative coverage over 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentTrendChart data={stats.sentimentTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sentiment mix</CardTitle>
            <CardDescription>Share of overall tone</CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentDonut positive={stats.totals.positive} neutral={stats.totals.neutral} negative={stats.totals.negative} />
          </CardContent>
        </Card>
      </div>

      {/* Coverage timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage timeline</CardTitle>
          <CardDescription>Daily mention volume over 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <CoverageTimelineChart data={stats.coverageTimeline} />
        </CardContent>
      </Card>

      {/* Quick AI insights */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle>Quick AI insights</CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px]">{isAIConfigured() ? "AI enhanced" : "Rule-based"}</Badge>
          </div>
          <CardDescription>Automated analysis of your current coverage</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <div key={i} className={cn("rounded-lg border border-l-4 bg-card px-4 py-3 text-sm", toneStyles[insight.tone])}>
              {insight.text}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sources / keywords / topics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Radio className="size-4" /> Top news sources</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSources.length ? (
              <HorizontalBar data={stats.topSources.map((s) => ({ name: s.name, value: s.count }))} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Tags className="size-4" /> Keyword performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.keywordPerformance.length ? (
              stats.keywordPerformance.slice(0, 6).map((k) => (
                <div key={k.term} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{k.term}</span>
                    <span className="text-muted-foreground">{k.mentions}</span>
                  </div>
                  <Progress value={Math.min(100, (k.mentions / (stats.keywordPerformance[0]?.mentions || 1)) * 100)} className="h-1.5" />
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No keywords yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Flame className="size-4" /> Trending topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.trendingTopics.length ? (
                stats.trendingTopics.map((t) => (
                  <Badge key={t.topic} variant="secondary" className="gap-1.5">
                    {t.topic}
                    <span className="text-muted-foreground">{t.count}</span>
                  </Badge>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No topics yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor + alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Competitor comparison</CardTitle>
            <CardDescription>Share of voice and sentiment across tracked competitors</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <ShareOfVoiceChart data={stats.competitorComparison} />
            <div className="space-y-3">
              {stats.competitorComparison.map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{c.mentions} mentions</span>
                    <span className="font-medium text-foreground">{c.shareOfVoice}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="size-4" /> Recent alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentAlerts.length ? (
              stats.recentAlerts.map((a) => (
                <div key={a.id} className="rounded-lg border px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{a.title}</p>
                    <Badge variant={a.severity === "CRITICAL" || a.severity === "HIGH" ? "destructive" : "secondary"} className="text-[10px]">
                      {a.severity}
                    </Badge>
                  </div>
                  {a.message && <p className="line-clamp-1 text-xs text-muted-foreground">{a.message}</p>}
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No alerts triggered</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent articles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent articles</CardTitle>
            <Link href="/articles" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {stats.recentArticles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="flex items-center gap-4 py-3 transition-colors hover:bg-accent/40">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.publication}</p>
              </div>
              <SentimentBadge sentiment={a.sentiment} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
