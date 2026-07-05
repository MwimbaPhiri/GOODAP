import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyAccessToken } from "./jwt";
import { roleCan, type Permission, type Role } from "@/lib/constants";

export const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME || "mediapulse_session";
export const ORG_COOKIE = "mediapulse_org";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  jobTitle: string | null;
  isSuperAdmin: boolean;
};

export type OrgContext = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: string;
  role: Role;
};

/** Resolve the authenticated user from the session cookie (or null). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifyAccessToken(token);
  if (!claims) return null;

  const user = await db.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, email: true, name: true, avatar: true, jobTitle: true, isActive: true, isSuperAdmin: true },
  });
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    jobTitle: user.jobTitle,
    isSuperAdmin: user.isSuperAdmin,
  };
}

/** Full session context: user + the currently-active organization membership. */
export async function getSession(): Promise<{ user: SessionUser; org: OrgContext | null } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const store = await cookies();
  const preferredOrgId = store.get(ORG_COOKIE)?.value;

  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) return { user, org: null };

  const active =
    memberships.find((m) => m.organizationId === preferredOrgId) ?? memberships[0];

  return {
    user,
    org: {
      id: active.organization.id,
      name: active.organization.name,
      slug: active.organization.slug,
      logoUrl: active.organization.logoUrl,
      plan: active.organization.plan,
      role: active.role as Role,
    },
  };
}

/** All organizations the user can switch between. */
export async function getUserOrganizations(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    logoUrl: m.organization.logoUrl,
    role: m.role as Role,
  }));
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** For API routes: throw 401/403 unless requirements are met. */
export async function requireSession() {
  const session = await getSession();
  if (!session) throw new AuthError(401, "Authentication required");
  return session;
}

export async function requireOrg() {
  const session = await requireSession();
  if (!session.org) throw new AuthError(403, "No active organization");
  return { user: session.user, org: session.org };
}

export async function requirePermission(permission: Permission) {
  const { user, org } = await requireOrg();
  if (!roleCan(org.role, permission)) {
    throw new AuthError(403, `Missing permission: ${permission}`);
  }
  return { user, org };
}
