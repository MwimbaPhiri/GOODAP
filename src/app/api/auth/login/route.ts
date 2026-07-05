import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { loginSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/auth/password";
import { establishSession, setActiveOrg } from "@/lib/auth/cookies";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const input = loginSchema.parse(await req.json());

    const user = await db.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { memberships: { orderBy: { createdAt: "asc" } } },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      return fail(401, "Invalid email or password");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) return fail(401, "Invalid email or password");

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await establishSession(user);
    if (user.memberships[0]) await setActiveOrg(user.memberships[0].organizationId);

    await audit({
      userId: user.id,
      organizationId: user.memberships[0]?.organizationId,
      action: "auth.login",
      ip: req.headers.get("x-forwarded-for"),
    });

    return ok({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    return handleError(error);
  }
}
