import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { profileSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireSession();
    const input = profileSchema.parse(await req.json());
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.jobTitle !== undefined && { jobTitle: input.jobTitle }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.timezone !== undefined && { timezone: input.timezone }),
        ...(input.avatar !== undefined && { avatar: input.avatar }),
      },
      select: { id: true, name: true, jobTitle: true, phone: true, timezone: true, avatar: true },
    });
    await audit({ userId: user.id, action: "profile.update" });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
