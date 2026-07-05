import { requireOrg } from "@/lib/auth/session";
import { roleCan } from "@/lib/constants";
import { isAIConfigured } from "@/lib/ai/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AssistantClient } from "@/components/assistant/assistant-client";
import { Lock } from "lucide-react";

export const metadata = { title: "AI Assistant" };

export default async function AssistantPage() {
  const { org } = await requireOrg();
  if (!roleCan(org.role, "ai:use")) {
    return (
      <div>
        <PageHeader title="AI Assistant" />
        <EmptyState icon={Lock} title="No access" description="Your role does not have permission to use the AI assistant." />
      </div>
    );
  }
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader title="AI Assistant" description="Ask questions about your coverage — answers are grounded in your collected media (RAG)" />
      <AssistantClient aiEnabled={isAIConfigured()} />
    </div>
  );
}
