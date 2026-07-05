"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Rss, Trash2, Loader2, Globe, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/fetcher";
import { SOURCE_TYPES } from "@/lib/constants";

interface Source {
  id: string;
  name: string;
  type: string;
  url: string;
  country: string | null;
  language: string | null;
  domainAuthority: number | null;
  enabled: boolean;
  articleCount: number;
  lastFetchedAt: string | null;
}

const TYPE_ICON: Record<string, typeof Rss> = { RSS: Rss, GOOGLE_NEWS: Newspaper, SCRAPER: Globe };
const empty = { name: "", type: "RSS", url: "", country: "", language: "en", domainAuthority: "" };

export function SourcesClient({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["sources"], queryFn: () => apiFetch<Source[]>("/api/sources") });

  const create = useMutation({
    mutationFn: () =>
      apiFetch("/api/sources", {
        method: "POST",
        body: JSON.stringify({
          name: form.name, type: form.type, url: form.url,
          country: form.country || null, language: form.language || null,
          domainAuthority: form.domainAuthority ? Number(form.domainAuthority) : null,
        }),
      }),
    onSuccess: () => {
      toast.success("Source added");
      qc.invalidateQueries({ queryKey: ["sources"] });
      setOpen(false);
      setForm(empty);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiFetch(`/api/sources/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/sources/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Source removed");
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
  });

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Add source</Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Rss} title="No sources yet" description="Add RSS feeds, Google News queries or websites to collect coverage." action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Add source</Button> : undefined} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => {
            const Icon = TYPE_ICON[s.type] ?? Rss;
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <Badge variant="outline" className="mt-0.5 text-[10px]">{s.type}</Badge>
                      </div>
                    </div>
                    {canManage && <Switch checked={s.enabled} onCheckedChange={(v) => toggle.mutate({ id: s.id, enabled: v })} />}
                  </div>
                  <p className="mt-3 truncate text-xs text-muted-foreground">{s.url}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{s.articleCount} articles</span>
                    {canManage && (
                      <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => remove.mutate(s.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add media source</DialogTitle>
            <DialogDescription>For Google News, use a locale like “en-US” as the URL. For RSS, paste the feed URL.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="TechCrunch" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Domain authority</Label>
                <Input type="number" value={form.domainAuthority} onChange={(e) => setForm((f) => ({ ...f, domainAuthority: e.target.value }))} placeholder="0-100" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>URL / locale</Label>
              <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://example.com/feed.xml" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" />
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} placeholder="en" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name || !form.url}>
              {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />} Add source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
