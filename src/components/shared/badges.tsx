import { cn } from "@/lib/utils";

const SENTIMENT_STYLES: Record<string, string> = {
  POSITIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  NEUTRAL: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/20",
  NEGATIVE: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

const RISK_STYLES: Record<string, string> = {
  LOW: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  MEDIUM: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  CRITICAL: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", className)}>
      {children}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: string | null | undefined }) {
  if (!sentiment) return <Pill className="bg-muted text-muted-foreground">unknown</Pill>;
  return <Pill className={SENTIMENT_STYLES[sentiment] ?? SENTIMENT_STYLES.NEUTRAL}>{sentiment.toLowerCase()}</Pill>;
}

export function RiskBadge({ risk }: { risk: string | null | undefined }) {
  if (!risk) return null;
  return <Pill className={RISK_STYLES[risk] ?? RISK_STYLES.LOW}>{risk.toLowerCase()} risk</Pill>;
}
