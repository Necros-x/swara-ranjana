"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/requireStaff";
import { sendCustomerRequestEmail } from "@/lib/email/requestEmails";
import type { Json } from "@/types/database";

export type CustomerRequestReviewAction =
  | "APPROVE"
  | "REJECT"
  | "COMPLETE_REFUND";

export interface CustomerRequestReviewResult {
  ok: boolean;
  message: string;
  action?: string;
}

type RpcResponse = {
  data: Json | null;
  error: { message?: string } | null;
};

function record(
  value: Json | null,
): value is Record<string, Json | undefined> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function reviewCustomerRequest(
  requestId: string,
  action: CustomerRequestReviewAction,
  staffNote = "",
  refundReference = "",
): Promise<CustomerRequestReviewResult> {
  try {
    const { user } = await requireStaff(["SUPER_ADMIN", "ADMIN"]);

    if (!requestId) {
      return { ok: false, message: "Request not found." };
    }

    const admin = createAdminClient();
    const rpc = admin.rpc.bind(admin) as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<RpcResponse>;

    const { data, error } = await rpc(
      "review_customer_order_request_server",
      {
        p_staff_user_id: user.id,
        p_request_id: requestId,
        p_action: action,
        p_staff_note: staffNote.trim() || null,
        p_refund_reference: refundReference.trim() || null,
      },
    );

    if (error || !record(data) || data.ok !== true) {
      return {
        ok: false,
        message:
          record(data) && typeof data.message === "string"
            ? data.message
            : error?.message || "Unable to update this request.",
      };
    }

    const resultAction =
      typeof data.action === "string" ? data.action : undefined;

    const emailEvent =
      resultAction === "REFUND_APPROVED"
        ? "APPROVED"
        : resultAction === "REJECTED"
          ? "REJECTED"
          : resultAction === "PARTIAL_REFUND_COMPLETED" ||
              resultAction === "FULL_REFUND_COMPLETED" ||
              resultAction === "CANCELLATION_COMPLETED"
            ? "COMPLETED"
            : null;

    if (emailEvent) {
      await sendCustomerRequestEmail(requestId, emailEvent).catch(
        (emailError) => {
          console.error("Request status email failed:", emailError);
        },
      );
    }

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/tickets");
    revalidatePath("/account");

    return {
      ok: true,
      action: resultAction,
      message:
        typeof data.message === "string"
          ? data.message
          : "Request updated.",
    };
  } catch (error) {
    console.error("Customer request review crashed:", error);
    return {
      ok: false,
      message:
        "This request could not be updated. Refresh the page and try again.",
    };
  }
}
