import Profile from "@/admin-site/pages/Profile";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { user, profile } = await requireStaff();
  const params = await searchParams;

  return (
    <Profile
      name={profile.display_name}
      email={user.email ?? ""}
      role={profile.role}
      status={profile.status}
      success={params.success}
      error={params.error}
    />
  );
}
