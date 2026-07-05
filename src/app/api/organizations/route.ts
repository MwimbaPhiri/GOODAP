import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, handleError } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { setActiveOrg } from "@/lib/auth/cookies";
import { ROLES } from "@/lib/constants";
import { audit } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2).max(80) });

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "workspace";
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const { name } = schema.parse(await req.json());

    let slug = slugify(name);
    if (await db.organization.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const org = await db.organization.create({
      data: {
        name,
        slug,
        plan: "PRO",
        memberships: { create: { userId: user.id, role: ROLES.ADMINISTRATOR } },
      },
    });
    await setActiveOrg(org.id);
    await audit({ userId: user.id, organizationId: org.id, action: "organization.create" });
    return created({ id: org.id, name: org.name, slug: org.slug });
  } catch (error) {
    return handleError(error);
  }
}
