"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/requireStaff";
import { sendTicketsIssuedEmail } from "@/lib/email/orderEmails";
import type { Json } from "@/types/database";

function rec(
  value: Json | undefined,
): value is Record<string, Json | undefined> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function msg(value: Json | undefined, fallback: string) {
  return rec(value) && typeof value.message === "string"
    ? value.message
    : fallback;
}

export async function selectPaymentMethod(
  orderNumber: string,
  accessToken: string,
  method: "CARD" | "ON_ARRIVAL" | "BANK_SLIP",
) {
  const { data, error } = await createAdminClient().rpc(
    "select_payment_method",
    {
      p_order_number: orderNumber,
      p_access_token: accessToken,
      p_method: method,
    },
  );

  if (error || !rec(data) || data.ok !== true) {
    return {
      ok: false,
      message:
        error?.message ??
        msg(data, "Unable to select payment method."),
    };
  }

  return { ok: true };
}

export async function confirmOnArrival(
  orderNumber: string,
  accessToken: string,
) {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("confirm_on_arrival", {
    p_order_number: orderNumber,
    p_access_token: accessToken,
  });

  if (error || !rec(data) || data.ok !== true) {
    return {
      ok: false,
      message:
        error?.message ??
        msg(data, "Unable to confirm pay on arrival."),
    };
  }

  const { data: order } = await admin
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .eq("access_token", accessToken)
    .maybeSingle();

  if (order?.id) {
    await sendTicketsIssuedEmail(order.id).catch((emailError) => {
      console.error("Ticket email failed:", emailError);
    });
  }

  revalidatePath(`/payment/${orderNumber}`);
  revalidatePath("/account");
  revalidatePath("/admin/orders");

  return { ok: true };
}

export async function uploadPaymentSlip(formData: FormData) {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const accessToken = String(formData.get("accessToken") ?? "");
  const file = formData.get("slip");

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      message: "Choose a payment slip first.",
    };
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      message: "Upload JPG, PNG, WebP or PDF only.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      ok: false,
      message: "Payment slip must be 5 MB or smaller.",
    };
  }

  const ext = (file.name.split(".").pop() || "bin")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  const path = `${orderNumber}/${randomUUID()}.${ext}`;
  const supabase = createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from("payment-slips")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: uploadError.message,
    };
  }

  const { data, error } = await supabase.rpc(
    "submit_bank_slip_metadata",
    {
      p_order_number: orderNumber,
      p_access_token: accessToken,
      p_storage_path: path,
      p_original_filename: file.name,
      p_mime_type: file.type,
      p_file_size: file.size,
    },
  );

  if (error || !rec(data) || data.ok !== true) {
    await supabase.storage.from("payment-slips").remove([path]);

    return {
      ok: false,
      message:
        error?.message ??
        msg(data, "Unable to submit payment slip."),
    };
  }

  revalidatePath(`/payment/${orderNumber}`);
  revalidatePath("/account");
  revalidatePath("/admin/orders");

  return { ok: true };
}

export async function reviewBankSlip(
  submissionId: string,
  approve: boolean,
  reason = "",
) {
  const { supabase } = await requireStaff([
    "SUPER_ADMIN",
    "ADMIN",
    "BOX_OFFICE",
  ]);

  const admin = createAdminClient();
  const { data: submission } = await admin
    .from("payment_submissions")
    .select("order_id")
    .eq("id", submissionId)
    .maybeSingle();

  const { data, error } = await supabase.rpc("review_bank_slip", {
    p_submission_id: submissionId,
    p_approve: approve,
    p_reason: reason || null,
  });

  if (error || !rec(data) || data.ok !== true) {
    return {
      ok: false,
      message:
        error?.message ??
        msg(data, "Unable to review slip."),
    };
  }

  if (approve && submission?.order_id) {
    await sendTicketsIssuedEmail(submission.order_id).catch(
      (emailError) => {
        console.error("Ticket email failed:", emailError);
      },
    );
  }

  revalidatePath("/account");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/requests");

  return { ok: true };
}
