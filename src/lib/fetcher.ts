/** Minimal typed fetch wrapper for client components. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.error?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body?.error?.details);
  }
  return body.data as T;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}
