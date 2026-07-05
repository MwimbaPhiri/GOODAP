"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Settings, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { apiFetch } from "@/lib/fetcher";

interface Props {
  user: { name: string | null; email: string; avatar: string | null };
  role: Role;
}

export function UserMenu({ user, role }: Props) {
  const router = useRouter();
  const initials = (user.name ?? user.email).split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2">
          <Avatar className="size-7">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="bg-primary/15 text-xs text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{user.name ?? "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            <Badge variant="secondary" className="mt-1 w-fit text-[10px]">{ROLE_LABELS[role]}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <User className="mr-2 size-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/assistant")}>
          <LifeBuoy className="mr-2 size-4" /> Ask AI assistant
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
