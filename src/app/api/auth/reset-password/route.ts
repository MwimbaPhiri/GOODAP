import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = resetPasswordSchema.parse(await req.json());
    const record = await db.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });

    if (!record || record.purpose !== "PASSWORD_RESET" || record.usedAt || record.expiresAt < new Date()) {
      return fail(400, "This reset link is invalid or has expired");
    }

    const user = await db.user.findUnique({ where: { email: record.identifier } });
    if (!user) return fail(400, "Account not found");

    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } }),
      db.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      db.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
