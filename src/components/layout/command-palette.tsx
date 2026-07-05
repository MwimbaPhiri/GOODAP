"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Search as SearchIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { NAV_SECTIONS } from "@/lib/nav";
import { roleCan, type Role } from "@/lib/constants";

export function CommandPalette({ role, open, onOpenChange }: { role: Role; open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.key === "/" && ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or jump to…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {query && (
          <>
            <CommandGroup heading="Search">
              <CommandItem onSelect={() => run(() => router.push(`/search?q=${encodeURIComponent(query)}`))}>
                <SearchIcon className="mr-2 size-4" />
                Search articles for “{query}”
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((i) => !i.permission || roleCan(role, i.permission));
          if (items.length === 0) return null;
          return (
            <CommandGroup key={section.label} heading={section.label}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem key={item.href} onSelect={() => run(() => router.push(item.href))}>
                    <Icon className="mr-2 size-4" />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => run(() => setTheme("light"))}>
            <Sun className="mr-2 size-4" /> Light mode
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme("dark"))}>
            <Moon className="mr-2 size-4" /> Dark mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
