"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Swords, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ShareOfVoiceChart } from "@/components/dashboard/charts";
import { apiFetch } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  keywords: string[];
  articleCount: number;
}
interface DashboardStats {
  competitorComparison: { name: string; mentions: number; shareOfVoice: number; netSentiment: number }[];
}

export function CompetitorsClient({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", keywords: "" });

  const { data: competitors, isLoading } = useQuery({ queryKey: ["competitors"], queryFn: () => apiFetch<Competitor[]>("/api/competitors") });
  const { data: stats } = useQuery({ queryKey: ["dashboard"], queryFn: () => apiFetch<DashboardStats>("/api/dashboard") });

  const create = useMutation({
    mutationFn: () =>
      apiFetch("/api/competitors", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          website: form.website || null,
          keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      }),
    onSuccess: () => {
      toast.success("Competitor added");
      qc.invalidateQueries({ queryKey: ["competitors"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setForm({ name: "", website: "", keywords: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/competitors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Competitor removed");
      qc.invalidateQueries({ queryKey: ["competitors"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const comparison = stats?.competitorComparison ?? [];
  const maxMentions = Math.max(1, ...comparison.map((c) => c.mentions));

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Add competitor</Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Share of voice</CardTitle><CardDescription>Coverage distribution</CardDescription></CardHeader>
          <CardContent>
            {comparison.length ? <ShareOfVoiceChart data={comparison} /> : <p className="py-10 text-center text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Sentiment & volume comparison</CardTitle><CardDescription>Net sentiment and mention volume per brand</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {comparison.length ? comparison.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{c.mentions} mentions</span>
                    <span className={cn("font-medium", c.netSentiment >= 0 ? "text-emerald-500" : "text-red-500")}>
                      net {c.netSentiment > 0 ? "+" : ""}{c.netSentiment}
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.mentions / maxMentions) * 100}%` }} />
                </div>
              </div>
            )) : <p className="py-10 text-center text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : !competitors || competitors.length === 0 ? (
        <EmptyState icon={Swords} title="No competitors tracked" description="Add competitors to benchmark your share of voice and sentiment." action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Add competitor</Button> : undefined} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{c.website}</a>}
                  </div>
                  {canManage && <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => remove.mutate(c.id)}><Trash2 className="size-3.5" /></Button>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{c.articleCount} mentions tracked</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.keywords.slice(0, 4).map((k) => <span key={k} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{k}</span>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add competitor</DialogTitle>
            <DialogDescription>Coverage is attributed to a competitor when it matches any of its keywords.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Globex" /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://globex.com" /></div>
            <div className="space-y-1.5"><Label>Attribution keywords (comma-separated)</Label><Input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="Globex, Globex Corp" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name}>
              {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />} Add competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
