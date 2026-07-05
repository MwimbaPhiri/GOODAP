"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Bell, Trash2, Loader2, BellRing } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/fetcher";
import { ALERT_TYPES, ALERT_CHANNELS } from "@/lib/constants";

interface Alert {
  id: string;
  name: string;
  type: string;
  channels: string[];
  enabled: boolean;
  eventCount: number;
  lastTriggeredAt: string | null;
}
interface AlertEvent {
  id: string;
  title: string;
  message: string | null;
  severity: string;
  createdAt: string;
}
interface AlertsResponse {
  alerts: Alert[];
  events: AlertEvent[];
}

const TYPE_LABELS: Record<string, string> = {
  NEGATIVE_SENTIMENT: "Negative sentiment",
  KEYWORD_SPIKE: "Keyword spike",
  COMPETITOR_ACTIVITY: "Competitor activity",
  PUBLICATION: "Specific publication",
  BREAKING_NEWS: "Breaking news",
};

export function AlertsClient({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "NEGATIVE_SENTIMENT", channels: ["BROWSER", "EMAIL"] as string[] });

  const { data, isLoading } = useQuery({ queryKey: ["alerts"], queryFn: () => apiFetch<AlertsResponse>("/api/alerts") });

  const create = useMutation({
    mutationFn: () => apiFetch("/api/alerts", { method: "POST", body: JSON.stringify({ name: form.name, type: form.type, channels: form.channels, condition: {} }) }),
    onSuccess: () => {
      toast.success("Alert created");
      qc.invalidateQueries({ queryKey: ["alerts"] });
      setOpen(false);
      setForm({ name: "", type: "NEGATIVE_SENTIMENT", channels: ["BROWSER", "EMAIL"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => apiFetch(`/api/alerts/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/alerts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Alert deleted");
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  function toggleChannel(ch: string) {
    setForm((f) => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch] }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {canManage && (
          <div className="flex justify-end">
            <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> New alert</Button>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : !data || data.alerts.length === 0 ? (
          <EmptyState icon={Bell} title="No alerts configured" description="Create alert rules to stay ahead of reputation risks." action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> New alert</Button> : undefined} />
        ) : (
          <div className="space-y-3">
            {data.alerts.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Bell className="size-4" /></div>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[a.type] ?? a.type}</Badge>
                        {a.channels.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c.replace("DIGEST_", "").toLowerCase()}</Badge>)}
                        <span className="text-xs text-muted-foreground">· {a.eventCount} triggers</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canManage && <Switch checked={a.enabled} onCheckedChange={(v) => toggle.mutate({ id: a.id, enabled: v })} />}
                    {canManage && <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove.mutate(a.id)}><Trash2 className="size-3.5" /></Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BellRing className="size-4" /> Recent triggers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!data || data.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No triggers yet</p>
          ) : (
            data.events.slice(0, 12).map((e) => (
              <div key={e.id} className="rounded-lg border px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{e.title}</p>
                  <Badge variant={["CRITICAL", "HIGH"].includes(e.severity) ? "destructive" : "secondary"} className="text-[10px]">{e.severity}</Badge>
                </div>
                {e.message && <p className="line-clamp-1 text-xs text-muted-foreground">{e.message}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">{formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New alert</DialogTitle>
            <DialogDescription>Choose a trigger and the channels to be notified on.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Negative sentiment watch" /></div>
            <div className="space-y-1.5">
              <Label>Trigger type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALERT_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex flex-wrap gap-2">
                {ALERT_CHANNELS.map((ch) => (
                  <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${form.channels.includes(ch) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                    {ch.replace("DIGEST_", "").toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name}>
              {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />} Create alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
