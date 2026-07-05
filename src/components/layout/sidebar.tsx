"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/nav";
import { roleCan, type Role } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { OrgSwitcher } from "@/components/layout/org-switcher";

interface SidebarProps {
  role: Role;
  org: { id: string; name: string; logoUrl: string | null };
  organizations: { id: string; name: string; logoUrl: string | null; role: Role }[];
  onNavigate?: () => void;
}

export function Sidebar({ role, org, organizations, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-1 bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="px-3 pt-3">
        <OrgSwitcher current={org} organizations={organizations} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((i) => !i.permission || roleCan(role, i.permission));
          if (items.length === 0) return null;
          return (
            <div key={section.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 p-3">
          <p className="text-xs font-medium">Press ⌘K</p>
          <p className="text-[11px] text-muted-foreground">Open the command palette to jump anywhere.</p>
        </div>
      </div>
    </div>
  );
}
