import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchClient } from "@/components/articles/search-client";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div>
      <PageHeader title="Advanced search" description="Filter coverage by sentiment, source, author, country, language, topic, risk and date" />
      <Suspense fallback={null}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
