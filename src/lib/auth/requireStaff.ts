import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/types/database";

export async function requireStaff(allowedRoles?: StaffRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("user_id, display_name, role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "ACTIVE") {
    redirect("/admin/login?error=not-authorized");
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    redirect(profile.role === "SCANNER" ? "/admin/scanner" : "/admin/dashboard");
  }

  return { supabase, user, profile };
}
