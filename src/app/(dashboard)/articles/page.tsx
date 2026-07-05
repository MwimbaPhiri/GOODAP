import { PageHeader } from "@/components/shared/page-header";
import { ArticlesExplorer } from "@/components/articles/articles-explorer";

export const metadata = { title: "Articles" };

export default function ArticlesPage() {
  return (
    <div>
      <PageHeader title="Articles" description="Every mention collected across your monitored sources" />
      <ArticlesExplorer />
    </div>
  );
}
