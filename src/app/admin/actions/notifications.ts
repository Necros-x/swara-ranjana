"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createAdminClient } from "@/lib/supabase/admin";

function validNotificationId(value: string) {
  return (
    value.length > 0 &&
    value.length <= 160 &&
    (value.startsWith("slip:") ||
      value.startsWith("request:") ||
      value.startsWith("expiry:"))
  );
}

export async function markAdminNotificationsRead(notificationIds: string[]) {
  const { user } = await requireStaff();
  const ids = [...new Set(notificationIds.map(String))]
    .filter(validNotificationId)
    .slice(0, 50);

  if (ids.length === 0) return { ok: true };

  const admin = createAdminClient() as unknown as SupabaseClient;
  const { error } = await admin.from("admin_notification_reads").upsert(
    ids.map((notificationId) => ({
      user_id: user.id,
      notification_id: notificationId,
      read_at: new Date().toISOString(),
    })),
    { onConflict: "user_id,notification_id" },
  );

  if (error) {
    console.error("Notification read-state update failed:", error);
    return { ok: false, message: "Unable to update notifications." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}
