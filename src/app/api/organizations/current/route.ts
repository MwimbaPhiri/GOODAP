import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requireOrg, requirePermission } from "@/lib/auth/session";
import { orgSettingsSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function GET() {
  try {
    const { org } = await requireOrg();
    const organization = await db.organization.findUnique({ where: { id: org.id } });
    if (!organization) return ok(null);
    return ok({ ...organization, monitoringConfig: organization.monitoringConfig ? JSON.parse(organization.monitoringConfig) : null });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { org, user } = await requirePermission("org:manage");
    const input = orgSettingsSchema.parse(await req.json());
    const updated = await db.organization.update({
      where: { id: org.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.website !== undefined && { website: input.website }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        ...(input.monitoringConfig !== undefined && { monitoringConfig: JSON.stringify(input.monitoringConfig) }),
      },
    });
    await audit({ userId: user.id, organizationId: org.id, action: "organization.update" });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
