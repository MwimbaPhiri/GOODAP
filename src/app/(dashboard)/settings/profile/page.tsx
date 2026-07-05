import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/settings/profile-form";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const { user } = await requireSession();
  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, jobTitle: true, phone: true, timezone: true, avatar: true },
  });

  return (
    <div className="max-w-2xl">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader title="Profile" description="Update your personal information" />
      <ProfileForm initial={record!} />
    </div>
  );
}
