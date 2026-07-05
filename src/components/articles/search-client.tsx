"use client";

import { useSearchParams } from "next/navigation";
import { ArticlesExplorer } from "@/components/articles/articles-explorer";

export function SearchClient() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  return <ArticlesExplorer initialQuery={q} showFiltersDefault />;
}
