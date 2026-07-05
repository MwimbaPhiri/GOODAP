import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
}

export function StatCard({ label, value, delta, icon: Icon, accent = "text-primary", hint }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          </div>
          <div className={cn("grid size-10 place-items-center rounded-lg bg-muted", accent)}>
            <Icon className="size-5" />
          </div>
        </div>
        {(delta !== undefined || hint) && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {delta !== undefined && (
              <span className={cn("inline-flex items-center gap-0.5 font-medium", positive ? "text-emerald-500" : "text-red-500")}>
                {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(delta)}%
              </span>
            )}
            <span className="text-muted-foreground">{hint ?? "vs previous period"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
