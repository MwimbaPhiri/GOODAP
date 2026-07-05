"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Newspaper, SlidersHorizontal, X } from "lucide-react";
import { ArticleCard, type ArticleListItem } from "@/components/articles/article-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/fetcher";
import { SENTIMENTS, RISK_LEVELS } from "@/lib/constants";

interface Facets {
  publications: string[];
  countries: string[];
  languages: string[];
}

interface ArticlesResponse {
  articles: ArticleListItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const DEFAULT_FILTERS = {
  q: "", sentiment: "ALL", risk: "ALL", source: "ALL", author: "",
  country: "ALL", language: "ALL", topic: "", from: "", to: "",
};

export function ArticlesExplorer({ initialQuery = "", showFiltersDefault = false }: { initialQuery?: string; showFiltersDefault?: boolean }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, q: initialQuery });
  const [applied, setApplied] = useState({ ...DEFAULT_FILTERS, q: initialQuery });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(showFiltersDefault);

  const { data: facets } = useQuery({
    queryKey: ["facets"],
    queryFn: () => apiFetch<Facets>("/api/articles/facets"),
  });

  const params = new URLSearchParams({ ...applied, page: String(page) });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["articles", applied, page],
    queryFn: () => apiFetch<ArticlesResponse>(`/api/articles?${params.toString()}`),
    placeholderData: keepPreviousData,
  });

  function set<K extends keyof typeof filters>(key: K, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }
  function apply() {
    setPage(1);
    setApplied(filters);
  }
  function reset() {
    setFilters(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setPage(1);
  }

  const activeCount = Object.entries(applied).filter(([k, v]) => v && v !== "ALL" && !(k === "q")).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search articles, publications, authors…"
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="mr-2 size-4" /> Filters
          {activeCount > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeCount}</span>}
        </Button>
        <Button onClick={apply}>Search</Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Sentiment" value={filters.sentiment} onChange={(v) => set("sentiment", v)} options={SENTIMENTS} />
            <FilterSelect label="Risk level" value={filters.risk} onChange={(v) => set("risk", v)} options={RISK_LEVELS} />
            <FilterSelect label="Publication" value={filters.source} onChange={(v) => set("source", v)} options={facets?.publications ?? []} />
            <FilterSelect label="Country" value={filters.country} onChange={(v) => set("country", v)} options={facets?.countries ?? []} />
            <FilterSelect label="Language" value={filters.language} onChange={(v) => set("language", v)} options={facets?.languages ?? []} />
            <div className="space-y-1.5">
              <Label className="text-xs">Author</Label>
              <Input value={filters.author} onChange={(e) => set("author", e.target.value)} placeholder="Any author" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Topic</Label>
              <Input value={filters.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Finance" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} />
              </div>
            </div>
            <div className="flex items-end gap-2 lg:col-span-4">
              <Button onClick={apply} size="sm">Apply filters</Button>
              <Button onClick={reset} variant="ghost" size="sm"><X className="mr-1 size-4" /> Clear</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{data ? `${data.pagination.total.toLocaleString()} results` : "Loading…"}</span>
        {isFetching && !isLoading && <span className="text-xs">Updating…</span>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.articles.length === 0 ? (
        <EmptyState icon={Newspaper} title="No articles found" description="Try adjusting your filters or run a collection to gather fresh coverage." />
      ) : (
        <>
          <div className="space-y-3">
            {data.articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="capitalize">{o.toLowerCase()}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
