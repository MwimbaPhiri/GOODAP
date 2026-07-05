"use client";

import { Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SentimentTrendChart } from "@/components/dashboard/charts";
import { downloadReportPdf } from "@/lib/pdf";
import type { ReportData } from "@/lib/reports";

export function ReportView({ data }: { data: ReportData & { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
            <Badge variant="secondary">{data.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(data.period.start), "MMM d, yyyy")} – {format(new Date(data.period.end), "MMM d, yyyy")}
          </p>
        </div>
        <Button onClick={() => downloadReportPdf(data)}><Download className="mr-2 size-4" /> Download PDF</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Executive summary</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{data.executiveSummary}</p></CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total mentions", value: data.totals.total },
          { label: "Net sentiment", value: data.totals.netSentiment },
          { label: "High risk", value: data.totals.highRisk },
          { label: "Est. reach", value: data.totals.totalReach.toLocaleString() },
        ].map((m) => (
          <Card key={m.label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{m.label}</p><p className="mt-1 text-2xl font-semibold">{m.value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sentiment over time</CardTitle></CardHeader>
        <CardContent><SentimentTrendChart data={data.sentimentTrend} /></CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Top publications</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Publication</TableHead><TableHead className="text-right">Mentions</TableHead><TableHead className="text-right">Reach</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.topPublications.map((p) => (
                  <TableRow key={p.name}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-right">{p.count}</TableCell><TableCell className="text-right">{p.reach.toLocaleString()}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top journalists</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Journalist</TableHead><TableHead className="text-right">Mentions</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.topJournalists.length ? data.topJournalists.map((j) => (
                  <TableRow key={j.name}><TableCell className="font-medium">{j.name}</TableCell><TableCell className="text-right">{j.count}</TableCell></TableRow>
                )) : <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No attributed authors</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">AI commentary</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{data.aiCommentary}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm"><span className="font-semibold text-primary">{i + 1}.</span> {r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
