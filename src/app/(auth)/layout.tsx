import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="mb-8">
          <Logo size="lg" />
        </Link>
        <div className="w-full max-w-md animate-fade-up">{children}</div>
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} MediaPulse AI · Enterprise media intelligence
        </p>
      </div>
    </div>
  );
}
