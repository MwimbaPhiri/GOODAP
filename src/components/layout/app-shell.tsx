"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import type { Role } from "@/lib/constants";

export interface ShellData {
  user: { name: string | null; email: string; avatar: string | null };
  org: { id: string; name: string; logoUrl: string | null };
  role: Role;
  organizations: { id: string; name: string; logoUrl: string | null; role: Role }[];
}

export function AppShell({ data, children }: { data: ShellData; children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar role={data.role} org={data.org} organizations={data.organizations} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar role={data.role} org={data.org} organizations={data.organizations} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={data.user}
          role={data.role}
          onOpenCommand={() => setCmdOpen(true)}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <CommandPalette role={data.role} open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
