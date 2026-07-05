"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/fetcher";

export function AcceptInviteClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "auth">("idle");
  const [message, setMessage] = useState("");

  async function accept() {
    setState("loading");
    try {
      await apiFetch("/api/auth/accept-invite", { method: "POST", body: JSON.stringify({ token }) });
      setState("success");
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1200);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setState("auth");
        return;
      }
      setState("error");
      setMessage(e instanceof Error ? e.message : "Failed to accept invitation");
    }
  }

  useEffect(() => {
    if (token) accept();
    else {
      setState("error");
      setMessage("Missing invitation token");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Join organization</CardTitle>
        <CardDescription>Accepting your invitation to MediaPulse AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state === "loading" && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Verifying…</div>}
        {state === "success" && <div className="flex items-center gap-2 text-sm text-emerald-500"><CheckCircle2 className="size-4" /> Success! Redirecting…</div>}
        {state === "error" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-destructive"><XCircle className="size-4" /> {message}</div>
            <Button asChild variant="outline" className="w-full"><Link href="/dashboard">Go to dashboard</Link></Button>
          </div>
        )}
        {state === "auth" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Please sign in or create an account to accept this invitation.</p>
            <div className="flex gap-2">
              <Button asChild className="flex-1"><Link href={`/login?next=/accept-invite?token=${token}`}>Sign in</Link></Button>
              <Button asChild variant="outline" className="flex-1"><Link href="/register">Register</Link></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
