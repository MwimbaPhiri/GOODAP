import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations";
import { addMinutes, generateToken, hashToken } from "@/lib/auth/tokens";

export async function POST(req: NextRequest) {
  try {
    const { email } = forgotPasswordSchema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always respond success to avoid account enumeration.
    if (user) {
      const token = generateToken();
      await db.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          tokenHash: hashToken(token),
          purpose: "PASSWORD_RESET",
          expiresAt: addMinutes(new Date(), 60),
        },
      });
      // In production this link is emailed. In the demo we return it so the flow
      // can be completed end-to-end without an email provider.
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/reset-password?token=${token}`;
      return ok({ sent: true, devResetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl });
    }

    return ok({ sent: true });
  } catch (error) {
    return handleError(error);
  }
}
