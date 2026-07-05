import "server-only";
import { cookies } from "next/headers";
import { signAccessToken } from "./jwt";
import { AUTH_COOKIE, ORG_COOKIE } from "./session";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function establishSession(user: { id: string; email: string; name?: string | null }) {
  const token = await signAccessToken({ sub: user.id, email: user.email, name: user.name ?? undefined });
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function setActiveOrg(orgId: string) {
  const store = await cookies();
  store.set(ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  store.delete(ORG_COOKIE);
}
