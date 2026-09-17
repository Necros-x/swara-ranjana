"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createAdminClient } from "@/lib/supabase/admin";

function profileRedirect(kind: "success" | "error", message: string): never {
  redirect(`/admin/profile?${kind}=${encodeURIComponent(message)}`);
}

export async function updateAdminProfile(formData: FormData) {
  const { user } = await requireStaff();
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (displayName.length < 2 || displayName.length > 80) {
    profileRedirect("error", "Display name must be between 2 and 80 characters.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("staff_profiles")
    .update({ display_name: displayName })
    .eq("user_id", user.id);

  if (error) {
    console.error("Admin profile update failed:", error);
    profileRedirect("error", "Unable to update your profile.");
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin", "layout");
  profileRedirect("success", "Profile updated.");
}

export async function updateAdminPassword(formData: FormData) {
  const { supabase } = await requireStaff();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 10) {
    profileRedirect("error", "Use a password with at least 10 characters.");
  }
  if (password !== confirmPassword) {
    profileRedirect("error", "The passwords do not match.");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Admin password update failed:", error);
    profileRedirect("error", error.message || "Unable to update your password.");
  }

  profileRedirect("success", "Password updated successfully.");
}
