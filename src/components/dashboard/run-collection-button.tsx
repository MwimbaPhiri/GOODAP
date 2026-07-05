"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/fetcher";

export function RunCollectionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await apiFetch<{ created: number; duplicates: number; alertsTriggered: number }>(
        "/api/monitoring/collect",
        { method: "POST", body: JSON.stringify({}) }
      );
      toast.success(`Collected ${res.created} new article(s)`, {
        description: `${res.duplicates} duplicates skipped · ${res.alertsTriggered} alerts triggered`,
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Collection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={run} disabled={loading} size="sm">
      <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Collecting…" : "Run collection"}
    </Button>
  );
}
