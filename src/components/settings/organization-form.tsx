"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/fetcher";
import { FREQUENCIES } from "@/lib/constants";

interface Props {
  initial: {
    name: string; website: string; industry: string; country: string; description: string; logoUrl: string;
    monitoringConfig: { frequency?: string; languages?: string[]; countries?: string[] };
  };
}

export function OrganizationForm({ initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial.name, website: initial.website, industry: initial.industry,
    country: initial.country, description: initial.description, logoUrl: initial.logoUrl,
    frequency: initial.monitoringConfig?.frequency ?? "HOURLY",
    languages: (initial.monitoringConfig?.languages ?? ["en"]).join(", "),
    countries: (initial.monitoringConfig?.countries ?? ["US"]).join(", "),
  });

  async function save() {
    setLoading(true);
    try {
      await apiFetch("/api/organizations/current", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name, website: form.website || null, industry: form.industry || null,
          country: form.country || null, description: form.description || null, logoUrl: form.logoUrl || null,
          monitoringConfig: {
            frequency: form.frequency,
            languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
            countries: form.countries.split(",").map((s) => s.trim()).filter(Boolean),
          },
        }),
      });
      toast.success("Organization updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Logo URL</Label><Input value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} placeholder="/logo.svg" /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="font-medium">Monitoring preferences</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Default frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map((x) => <SelectItem key={x} value={x} className="capitalize">{x.toLowerCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Languages</Label><Input value={form.languages} onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))} placeholder="en, fr" /></div>
            <div className="space-y-1.5"><Label>Countries</Label><Input value={form.countries} onChange={(e) => setForm((f) => ({ ...f, countries: e.target.value }))} placeholder="US, GB" /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading}>{loading && <Loader2 className="mr-2 size-4 animate-spin" />} Save changes</Button>
      </div>
    </div>
  );
}
