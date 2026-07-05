import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";
import { sourceSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const sources = await db.source.findMany({
      where: { organizationId: org.id },
      include: { _count: { select: { articles: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(sources.map((s) => ({ ...s, articleCount: s._count.articles })));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("keywords:manage");
    const input = sourceSchema.parse(await req.json());
    const source = await db.source.create({ data: { organizationId: org.id, ...input } });
    await audit({ userId: user.id, organizationId: org.id, action: "source.create", entityType: "source", entityId: source.id });
    return created(source);
  } catch (error) {
    return handleError(error);
  }
}
