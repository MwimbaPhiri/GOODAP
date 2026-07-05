"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Tags, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/fetcher";
import { KEYWORD_TYPES, PRIORITIES, KEYWORD_STATUSES, FREQUENCIES } from "@/lib/constants";

interface Keyword {
  id: string;
  term: string;
  type: string;
  priority: string;
  status: string;
  frequency: string;
  language: string;
  country: string | null;
  includeKeywords: string[];
  excludeKeywords: string[];
  matchCount: number;
}

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CRITICAL: "destructive", HIGH: "default", MEDIUM: "secondary", LOW: "outline",
};

const empty = {
  term: "", type: "COMPANY", priority: "MEDIUM", status: "ACTIVE",
  frequency: "HOURLY", language: "en", country: "", include: "", exclude: "",
};

export function KeywordsClient({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Keyword | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ["keywords"], queryFn: () => apiFetch<Keyword[]>("/api/keywords") });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        term: form.term,
        type: form.type,
        priority: form.priority,
        status: form.status,
        frequency: form.frequency,
        language: form.language,
        country: form.country || null,
        includeKeywords: form.include.split(",").map((s) => s.trim()).filter(Boolean),
        excludeKeywords: form.exclude.split(",").map((s) => s.trim()).filter(Boolean),
      };
      return editing
        ? apiFetch(`/api/keywords/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : apiFetch("/api/keywords", { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      toast.success(editing ? "Keyword updated" : "Keyword created");
      qc.invalidateQueries({ queryKey: ["keywords"] });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/keywords/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Keyword deleted");
      qc.invalidateQueries({ queryKey: ["keywords"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(k: Keyword) {
    setEditing(k);
    setForm({
      term: k.term, type: k.type, priority: k.priority, status: k.status, frequency: k.frequency,
      language: k.language, country: k.country ?? "",
      include: k.includeKeywords.join(", "), exclude: k.excludeKeywords.join(", "),
    });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={openCreate}><Plus className="mr-2 size-4" /> Add keyword</Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No keywords yet"
          description="Add keywords to start monitoring how your organization is mentioned."
          action={canManage ? <Button onClick={openCreate}><Plus className="mr-2 size-4" /> Add keyword</Button> : undefined}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Mentions</TableHead>
                {canManage && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.term}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{k.type}</Badge></TableCell>
                  <TableCell><Badge variant={PRIORITY_VARIANT[k.priority]} className="text-[10px]">{k.priority}</Badge></TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className={`size-2 rounded-full ${k.status === "ACTIVE" ? "bg-emerald-500" : k.status === "PAUSED" ? "bg-amber-500" : "bg-muted-foreground"}`} />
                      {k.status.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{k.frequency.toLowerCase()}</TableCell>
                  <TableCell className="text-right font-medium">{k.matchCount}</TableCell>
                  {canManage && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(k)}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove.mutate(k.id)}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit keyword" : "Add keyword"}</DialogTitle>
            <DialogDescription>Configure what to monitor and how often.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Term</Label>
              <Input value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))} placeholder="e.g. Acme Corp" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelect label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={KEYWORD_TYPES} />
              <FormSelect label="Priority" value={form.priority} onChange={(v) => setForm((f) => ({ ...f, priority: v }))} options={PRIORITIES} />
              <FormSelect label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={KEYWORD_STATUSES} />
              <FormSelect label="Frequency" value={form.frequency} onChange={(v) => setForm((f) => ({ ...f, frequency: v }))} options={FREQUENCIES} />
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} placeholder="en" />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Include keywords (comma-separated)</Label>
              <Input value={form.include} onChange={(e) => setForm((f) => ({ ...f, include: e.target.value }))} placeholder="launch, funding" />
            </div>
            <div className="space-y-1.5">
              <Label>Exclude keywords (comma-separated)</Label>
              <Input value={form.exclude} onChange={(e) => setForm((f) => ({ ...f, exclude: e.target.value }))} placeholder="jobs, hiring" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.term.trim()}>
              {save.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? "Save changes" : "Create keyword"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o} className="capitalize">{o.toLowerCase()}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
