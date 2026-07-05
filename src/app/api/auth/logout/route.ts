import { handleError, ok } from "@/lib/api";
import { clearSession } from "@/lib/auth/cookies";

export async function POST() {
  try {
    await clearSession();
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
