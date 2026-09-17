import Staff from "@/admin-site/pages/Staff";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getAdminStaffMembers } from "@/lib/admin/staff";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { user } = await requireStaff(["SUPER_ADMIN"]);
  const [members, params] = await Promise.all([
    getAdminStaffMembers(),
    searchParams,
  ]);

  return (
    <Staff
      members={members}
      currentUserId={user.id}
      successMessage={params.success}
      errorMessage={params.error}
    />
  );
}
