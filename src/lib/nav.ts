import type { Permission } from "@/lib/constants";
import {
  LayoutDashboard, Newspaper, Search, Tags, Rss, Swords, Bell, FileText,
  Sparkles, Settings, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  shortcut?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "org:view", shortcut: "G D" },
      { label: "Articles", href: "/articles", icon: Newspaper, permission: "articles:view", shortcut: "G A" },
      { label: "Search", href: "/search", icon: Search, permission: "articles:view", shortcut: "G S" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Keywords", href: "/keywords", icon: Tags, permission: "keywords:view" },
      { label: "Sources", href: "/sources", icon: Rss, permission: "keywords:view" },
      { label: "Competitors", href: "/competitors", icon: Swords, permission: "articles:view" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "AI Assistant", href: "/assistant", icon: Sparkles, permission: "ai:use" },
      { label: "Alerts", href: "/alerts", icon: Bell, permission: "alerts:view" },
      { label: "Reports", href: "/reports", icon: FileText, permission: "reports:view" },
    ],
  },
  {
    label: "Workspace",
    items: [{ label: "Settings", href: "/settings", icon: Settings, permission: "org:view" }],
  },
];
