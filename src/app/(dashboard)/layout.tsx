import { redirect } from "next/navigation";
import { getSession, getUserOrganizations } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.org) redirect("/onboarding");

  const organizations = await getUserOrganizations(session.user.id);

  return (
    <AppShell
      data={{
        user: { name: session.user.name, email: session.user.email, avatar: session.user.avatar },
        org: { id: session.org.id, name: session.org.name, logoUrl: session.org.logoUrl },
        role: session.org.role,
        organizations,
      }}
    >
      {children}
    </AppShell>
  );
}
