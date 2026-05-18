"use client"

export type MvpUser = {
  id: string
  email: string
  name?: string | null
  role: "CLIENT" | "WORKER" | "AI_AGENT" | "REVIEWER" | "ADMIN"
  trustScore: number
  country?: string | null
  phone?: string | null
  organizationName?: string | null
  kycStatus?: string
}

const SESSION_KEY = "agent-trust-session"

export function getStoredUser(): MvpUser | null {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function storeUser(user: MvpUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  window.localStorage.removeItem(SESSION_KEY)
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || "Request failed")
  }

  return payload as T
}

export function statusClasses(status: string) {
  const normalized = status.toUpperCase()
  if (["APPROVED", "RELEASED", "VERIFIED", "PASS"].includes(normalized)) return "bg-emerald-400 text-slate-950"
  if (["REJECTED", "FAIL", "CANCELLED"].includes(normalized)) return "bg-red-400 text-slate-950"
  if (["DISPUTED", "NEEDS REVIEW"].includes(normalized)) return "bg-amber-300 text-slate-950"
  return "bg-white/10 text-slate-200"
}
