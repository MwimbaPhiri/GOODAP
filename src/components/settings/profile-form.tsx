"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/fetcher";

interface Props {
  initial: { name: string | null; email: string; jobTitle: string | null; phone: string | null; timezone: string };
}

export function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    jobTitle: initial.jobTitle ?? "",
    phone: initial.phone ?? "",
    timezone: initial.timezone ?? "UTC",
  });

  async function save() {
    setLoading(true);
    try {
      await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(form) });
      toast.success("Profile updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={initial.email} disabled />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Timezone</Label><Input value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={loading}>{loading && <Loader2 className="mr-2 size-4 animate-spin" />} Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
