"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Loader2, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/fetcher";
import { downloadReportPdf } from "@/lib/pdf";
import { REPORT_TYPES } from "@/lib/constants";
import type { ReportData } from "@/lib/reports";

interface ReportRow {
  id: string;
  title: string;
  type: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  createdBy: { name: string | null } | null;
}

export function ReportsClient({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "Monthly media report", type: "EXECUTIVE", periodDays: "30" });

  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: () => apiFetch<ReportRow[]>("/api/reports") });

  const generate = useMutation({
    mutationFn: () => apiFetch<ReportData & { id: string }>("/api/reports", { method: "POST", body: JSON.stringify({ title: form.title, type: form.type, periodDays: Number(form.periodDays) }) }),
    onSuccess: (report) => {
      toast.success("Report generated");
      qc.invalidateQueries({ queryKey: ["reports"] });
      setOpen(false);
      downloadReportPdf(report);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/reports/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Report deleted");
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const [downloading, setDownloading] = useState<string | null>(null);
  async function downloadExisting(id: string) {
    setDownloading(id);
    try {
      const data = await apiFetch<ReportData & { id: string }>(`/api/reports/${id}`);
      downloadReportPdf(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Generate report</Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={FileText} title="No reports yet" description="Generate an executive, coverage, sentiment or competitor report as a downloadable PDF." action={canManage ? <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Generate report</Button> : undefined} />
      ) : (
        <div className="grid gap-3">
          {data.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <Link href={`/reports/${r.id}`} className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-5" /></div>
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.periodStart), "MMM d")} – {format(new Date(r.periodEnd), "MMM d, yyyy")} · by {r.createdBy?.name ?? "System"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{r.type}</Badge>
                  <Button variant="outline" size="sm" onClick={() => downloadExisting(r.id)} disabled={downloading === r.id}>
                    {downloading === r.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  </Button>
                  {canManage && <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove.mutate(r.id)}><Trash2 className="size-3.5" /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>A PDF will be produced and downloaded automatically.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{REPORT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Select value={form.periodDays} onValueChange={(v) => setForm((f) => ({ ...f, periodDays: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending || !form.title}>
              {generate.isPending && <Loader2 className="mr-2 size-4 animate-spin" />} Generate & download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
