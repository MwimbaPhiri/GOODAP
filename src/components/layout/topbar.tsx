"use client";

import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Notifications } from "@/components/layout/notifications";
import { UserMenu } from "@/components/layout/user-menu";
import type { Role } from "@/lib/constants";

interface Props {
  user: { name: string | null; email: string; avatar: string | null };
  role: Role;
  onOpenCommand: () => void;
  onOpenMenu: () => void;
}

export function Topbar({ user, role, onOpenCommand, onOpenMenu }: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMenu} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>

      <button
        onClick={onOpenCommand}
        className="group flex h-9 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-md"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search articles, keywords…</span>
        <kbd className="hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">⌘K</kbd>
      </button>

      <div className="flex flex-1 items-center justify-end gap-1">
        <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => router.push("/assistant")}>
          Ask AI
        </Button>
        <ThemeToggle />
        <Notifications />
        <UserMenu user={user} role={role} />
      </div>
    </header>
  );
}
