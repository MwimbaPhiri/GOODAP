"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { apiFetch } from "@/lib/fetcher";

interface Props {
  current: { id: string; name: string; logoUrl: string | null };
  organizations: { id: string; name: string; logoUrl: string | null; role: Role }[];
}

export function OrgSwitcher({ current, organizations }: Props) {
  const router = useRouter();

  async function switchTo(id: string) {
    if (id === current.id) return;
    try {
      await apiFetch("/api/auth/switch-org", { method: "POST", body: JSON.stringify({ organizationId: id }) });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to switch");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between px-2.5">
          <span className="flex items-center gap-2 truncate">
            <Avatar className="size-6 rounded-md">
              <AvatarImage src={current.logoUrl ?? undefined} />
              <AvatarFallback className="rounded-md bg-primary/15 text-primary">
                <Building2 className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{current.name}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {organizations.map((o) => (
          <DropdownMenuItem key={o.id} onClick={() => switchTo(o.id)} className="gap-2">
            <Avatar className="size-6 rounded-md">
              <AvatarImage src={o.logoUrl ?? undefined} />
              <AvatarFallback className="rounded-md bg-primary/15 text-primary">
                <Building2 className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-sm">{o.name}</p>
              <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[o.role]}</p>
            </div>
            {o.id === current.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings/organization")}>
          Organization settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
