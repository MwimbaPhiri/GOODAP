import { handleError, ok } from "@/lib/api";
import { getSession, getUserOrganizations } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok(null);
    const organizations = await getUserOrganizations(session.user.id);
    return ok({ ...session, organizations });
  } catch (error) {
    return handleError(error);
  }
}
