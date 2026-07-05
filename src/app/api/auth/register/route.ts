import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, fail, handleError } from "@/lib/api";
import { registerSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth/password";
import { establishSession, setActiveOrg } from "@/lib/auth/cookies";
import { audit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "workspace";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) return fail(409, "An account with this email already exists");

    const passwordHash = await hashPassword(input.password);
    const orgName = input.organizationName?.trim() || `${input.name.split(" ")[0]}'s Workspace`;

    let slug = slugify(orgName);
    if (await db.organization.findUnique({ where: { slug } })) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const user = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        emailVerified: new Date(), // auto-verified in demo; wire real email in prod
        memberships: {
          create: {
            role: ROLES.ADMINISTRATOR,
            organization: {
              create: { name: orgName, slug, plan: "PRO" },
            },
          },
        },
      },
      include: { memberships: true },
    });

    await establishSession(user);
    await setActiveOrg(user.memberships[0].organizationId);
    await audit({ userId: user.id, organizationId: user.memberships[0].organizationId, action: "auth.register" });

    return created({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    return handleError(error);
  }
}
