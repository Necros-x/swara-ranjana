import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole, StaffStatus } from "@/types/database";

export interface AdminStaffMember {
  userId: string;
  displayName: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
  invitedAt: string | null;
  confirmedAt: string | null;
}

export async function getAdminStaffMembers(): Promise<AdminStaffMember[]> {
  const admin = createAdminClient();

  const [{ data: profiles, error: profileError }, { data: authData, error: authError }] =
    await Promise.all([
      admin
        .from("staff_profiles")
        .select(
          "user_id, display_name, role, status, last_active_at, created_at, updated_at",
        )
        .order("created_at", { ascending: true }),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  if (profileError) throw profileError;
  if (authError) throw authError;

  const users = new Map(authData.users.map((user) => [user.id, user]));

  return (profiles ?? []).map((profile) => {
    const user = users.get(profile.user_id);

    return {
      userId: profile.user_id,
      displayName: profile.display_name,
      email: user?.email ?? "Email unavailable",
      role: profile.role,
      status: profile.status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastActiveAt: user?.last_sign_in_at ?? profile.last_active_at,
      invitedAt: user?.invited_at ?? null,
      confirmedAt: user?.email_confirmed_at ?? null,
    };
  });
}
