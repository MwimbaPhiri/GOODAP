/**
 * Provider-agnostic AI client.
 *
 * When `OPENAI_API_KEY` is present, calls an OpenAI-compatible Chat Completions
 * endpoint over `fetch` (works with OpenAI, Azure OpenAI, OpenRouter, local
 * gateways, etc.). When no key is configured, callers should fall back to the
 * deterministic heuristics in `@/lib/analysis` so the platform is fully
 * functional offline.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function chatComplete(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  if (!isAIConfigured()) {
    throw new AIUnavailableError();
  }

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI provider error ${res.status}: ${text.slice(0, 300)}`);
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return payload.choices?.[0]?.message?.content ?? "";
}

export class AIUnavailableError extends Error {
  constructor() {
    super("AI provider not configured");
    this.name = "AIUnavailableError";
  }
}
