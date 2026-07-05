import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { AcceptInviteClient } from "@/components/accept-invite-client";

export const metadata = { title: "Accept invitation" };

export default function AcceptInvitePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <Suspense fallback={null}>
          <AcceptInviteClient />
        </Suspense>
      </div>
    </div>
  );
}
