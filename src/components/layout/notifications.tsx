"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function Notifications() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Notification[]>("/api/notifications"),
    refetchInterval: 60_000,
  });

  const markAll = useMutation({
    mutationFn: () => apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4.5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAll.mutate()}>
              <CheckCheck className="mr-1 size-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {!data || data.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</div>
          ) : (
            <ul className="divide-y">
              {data.map((n) => {
                const content = (
                  <div className={cn("px-4 py-3 transition-colors hover:bg-accent/50", !n.read && "bg-primary/5")}>
                    <div className="flex items-start gap-2">
                      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted-foreground/30" : "bg-primary")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{n.title}</p>
                        {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>{n.link ? <Link href={n.link}>{content}</Link> : content}</li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
