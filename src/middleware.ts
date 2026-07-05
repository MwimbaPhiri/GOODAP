import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME || "mediapulse_session";

const PROTECTED_PREFIXES = [
  "/dashboard", "/articles", "/keywords", "/alerts", "/reports",
  "/competitors", "/assistant", "/search", "/sources", "/settings",
];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

function securityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const claims = token ? await verifyAccessToken(token) : null;
  const isAuthed = Boolean(claims);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !isAuthed) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return securityHeaders(NextResponse.redirect(url));
  }

  if (isAuthPage && isAuthed) {
    return securityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)"],
};
