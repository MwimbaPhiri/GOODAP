import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requireOrg } from "@/lib/auth/session";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const [pubs, countries, languages] = await Promise.all([
      db.article.groupBy({ by: ["publication"], where: { organizationId: org.id }, _count: true, orderBy: { _count: { publication: "desc" } }, take: 40 }),
      db.article.groupBy({ by: ["country"], where: { organizationId: org.id }, _count: true }),
      db.article.groupBy({ by: ["language"], where: { organizationId: org.id }, _count: true }),
    ]);
    return ok({
      publications: pubs.map((p) => p.publication).filter(Boolean),
      countries: countries.map((c) => c.country).filter(Boolean),
      languages: languages.map((l) => l.language).filter(Boolean),
    });
  } catch (error) {
    return handleError(error);
  }
}
