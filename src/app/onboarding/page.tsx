import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata = { title: "Get started" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.org) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <OnboardingForm />
      </div>
    </div>
  );
}
