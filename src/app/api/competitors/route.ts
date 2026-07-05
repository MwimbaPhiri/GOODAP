import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { created, handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";
import { competitorSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const competitors = await db.competitor.findMany({
      where: { organizationId: org.id },
      include: { _count: { select: { articles: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(competitors.map((c) => ({ ...c, keywords: JSON.parse(c.keywords || "[]"), articleCount: c._count.articles })));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("competitors:manage");
    const input = competitorSchema.parse(await req.json());
    const competitor = await db.competitor.create({
      data: {
        organizationId: org.id,
        name: input.name,
        website: input.website ?? null,
        keywords: JSON.stringify(input.keywords.length ? input.keywords : [input.name]),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "competitor.create", entityType: "competitor", entityId: competitor.id });
    return created(competitor);
  } catch (error) {
    return handleError(error);
  }
}
