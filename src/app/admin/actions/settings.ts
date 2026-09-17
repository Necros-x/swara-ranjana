"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createAdminClient } from "@/lib/supabase/admin";

function settingsRedirect(kind: "success" | "error", message: string): never {
  redirect(`/admin/settings?${kind}=${encodeURIComponent(message)}`);
}

function clean(formData: FormData, name: string, max = 120) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

export async function saveBankTransferSettings(formData: FormData) {
  const { user } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);

  const bankName = clean(formData, "bankName", 120);
  const accountName = clean(formData, "accountName", 160);
  const accountNumber = clean(formData, "accountNumber", 80);
  const branch = clean(formData, "branch", 120);
  const isMock = formData.get("isMock") === "on";

  if (!bankName || !accountName || !accountNumber) {
    settingsRedirect(
      "error",
      "Bank name, account name and account number are required.",
    );
  }

  const admin = createAdminClient() as unknown as SupabaseClient;
  const { error } = await admin.from("app_settings").upsert(
    {
      key: "bank_transfer",
      value: {
        bankName,
        accountName,
        accountNumber,
        branch,
        isMock,
      },
      updated_by: user.id,
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("Bank transfer settings update failed:", error);
    settingsRedirect("error", "Unable to save bank transfer details.");
  }

  revalidatePath("/admin/settings");
  revalidatePath("/payment/[orderNumber]", "page");
  settingsRedirect("success", "Bank transfer details updated.");
}
