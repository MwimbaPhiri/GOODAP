"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Trash2, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/fetcher";
import { ROLES, ROLE_LABELS } from "@/lib/constants";

interface Member { membershipId: string; id: string; name: string | null; email: string; avatar: string | null; jobTitle: string | null; role: string }
interface Invitation { id: string; email: string; role: string; expiresAt: string }
interface TeamResponse { members: Member[]; invitations: Invitation[] }

const ROLE_VALUES = Object.values(ROLES);

export function TeamClient({ canInvite }: { canInvite: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", role: ROLES.ANALYST as string });

  const { data, isLoading } = useQuery({ queryKey: ["team"], queryFn: () => apiFetch<TeamResponse>("/api/team") });

  const invite = useMutation({
    mutationFn: () => apiFetch<{ devInviteUrl?: string }>("/api/team/invite", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["team"] });
      setOpen(false);
      setForm({ email: "", role: ROLES.ANALYST });
      if (res.devInviteUrl) {
        navigator.clipboard.writeText(res.devInviteUrl).catch(() => {});
        toast.success("Invitation created", { description: "Invite link copied to clipboard (dev mode)." });
      } else {
        toast.success("Invitation sent");
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiFetch(`/api/team/members/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const removeMember = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/team/members/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Member removed");
      qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="space-y-6">
      {canInvite && (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" /> Invite member</Button>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Members</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="m-4 h-40" />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead className="w-16" /></TableRow></TableHeader>
              <TableBody>
                {data?.members.map((m) => (
                  <TableRow key={m.membershipId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8"><AvatarImage src={m.avatar ?? undefined} /><AvatarFallback className="bg-primary/15 text-xs text-primary">{(m.name ?? m.email).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-medium">{m.name ?? "—"}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={m.role} onValueChange={(role) => changeRole.mutate({ id: m.membershipId, role })}>
                        <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLE_VALUES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeMember.mutate(m.membershipId)}><Trash2 className="size-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Pending invitations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.invitations.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /><span className="text-sm">{i.email}</span></div>
                <Badge variant="secondary" className="text-[10px]">{ROLE_LABELS[i.role as keyof typeof ROLE_LABELS] ?? i.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>They&apos;ll receive an invitation link to join this organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="teammate@company.com" /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(role) => setForm((f) => ({ ...f, role }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_VALUES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => invite.mutate()} disabled={invite.isPending || !form.email}>
              {invite.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Copy className="mr-2 size-4" />} Create invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
