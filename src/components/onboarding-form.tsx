"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/fetcher";

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  async function create() {
    setLoading(true);
    try {
      await apiFetch("/api/organizations", { method: "POST", body: JSON.stringify({ name }) });
      toast.success("Workspace created");
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
        <CardDescription>Set up an organization to start monitoring your media coverage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Organization name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" onKeyDown={(e) => e.key === "Enter" && name && create()} />
        </div>
        <Button className="w-full" onClick={create} disabled={loading || name.length < 2}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />} Create workspace
        </Button>
      </CardContent>
    </Card>
  );
}
