"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Send, Loader2, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

interface Citation { id: string; title: string; publication: string | null; url: string }
interface Msg { role: "user" | "assistant"; content: string; citations?: Citation[] }

const SUGGESTIONS = [
  "Summarize today's coverage.",
  "Why are negative mentions increasing?",
  "What topics are trending?",
  "Which journalists mention us most?",
  "Generate a media report.",
  "Recommend a communication strategy.",
  "Draft a press statement.",
  "Generate interview talking points.",
  "Generate a crisis response.",
];

export function AssistantClient({ aiEnabled }: { aiEnabled: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    try {
      const res = await apiFetch<{ conversationId: string; message: { content: string }; citations: Citation[]; usedAI: boolean }>(
        "/api/ai/assistant",
        { method: "POST", body: JSON.stringify({ message: content, conversationId }) }
      );
      setConversationId(res.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: res.message.content, citations: res.citations }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The assistant failed to respond");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-primary" /> MediaPulse Assistant</div>
        <Badge variant="secondary" className="text-[10px]">{aiEnabled ? "AI enhanced" : "Rule-based (RAG)"}</Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div ref={scrollRef} className="space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="size-6" /></div>
              <h3 className="font-medium">Ask about your media coverage</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these prompts:</p>
              <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className={cn("grid size-8 shrink-0 place-items-center rounded-full", m.role === "user" ? "bg-muted" : "bg-primary/10 text-primary")}>
                  {m.role === "user" ? <User className="size-4" /> : <Sparkles className="size-4" />}
                </div>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-border/40 pt-2">
                      <p className="text-[11px] font-medium opacity-70">Sources</p>
                      {m.citations.slice(0, 4).map((c) => (
                        <Link key={c.id} href={`/articles/${c.id}`} className="flex items-center gap-1.5 text-[11px] opacity-80 hover:opacity-100 hover:underline">
                          <FileText className="size-3" /> <span className="truncate">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="size-4" /></div>
              <div className="rounded-2xl bg-muted px-4 py-3"><Loader2 className="size-4 animate-spin text-muted-foreground" /></div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about your coverage…"
            className="max-h-32 min-h-11 resize-none"
            rows={1}
          />
          <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()} className="size-11 shrink-0">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
