"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email/resend";
import type { Json } from "@/types/database";

export interface AccountAuthResult {
  ok: boolean;
  message: string;
}

export interface CustomerOrderActionResult {
  ok: boolean;
  message: string;
  action?: "CANCELLED" | "CANCEL_REQUESTED" | "REFUND_REQUESTED";
}

function emailOf(value: string) {
  return value.trim().toLowerCase();
}

function loginEmailHtml(code: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0E1721;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FEFFFF;border:1px solid #d8dee3;border-top:4px solid #2271B1;">
            <tr>
              <td style="padding:28px;background:#0E1721;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#FEFFFF;letter-spacing:.03em;">
                  SWARA RANJANA
                </div>
                <div style="margin-top:8px;font-size:10px;line-height:1.4;color:#62B6F3;letter-spacing:3px;text-transform:uppercase;">
                  My Tickets • Secure Access
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.3;color:#0E1721;">
                  Your login code
                </div>
                <div style="margin-top:14px;font-size:14px;line-height:1.7;color:#7D8A95;">
                  Enter this one-time code to securely open your Swara Ranjana ticket account.
                </div>
                <div style="margin-top:26px;padding:20px;text-align:center;background:#F7F9FA;border-left:4px solid #2271B1;font-family:Arial,Helvetica,sans-serif;font-size:34px;line-height:1.2;font-weight:700;letter-spacing:10px;color:#0E1721;">
                  ${code}
                </div>
                <div style="margin-top:24px;font-size:12px;line-height:1.7;color:#7D8A95;">
                  If you did not request this code, you can ignore this email. Do not share this code with anyone.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function requestCustomerLoginCode(
  emailInput: string,
): Promise<AccountAuthResult> {
  const email = emailOf(emailInput);

  if (
    email.length < 5 ||
    email.length > 254 ||
    !email.includes("@")
  ) {
    return {
      ok: false,
      message: "Enter a valid email address.",
    };
  }

  try {
    const admin = createAdminClient();

    const { data: customer, error: lookupError } = await admin
      .from("customers")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("Customer account lookup failed:", lookupError);
      return {
        ok: false,
        message:
          "Login is temporarily unavailable. Please try again.",
      };
    }

    if (!customer) {
      return {
        ok: true,
        message:
          "If this email is linked to a reservation, a login code has been sent.",
      };
    }

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData?.properties?.email_otp) {
      console.error("Customer OTP generation failed:", linkError);
      return {
        ok: false,
        message:
          "We couldn't create a login code right now. Please try again.",
      };
    }

    const code = linkData.properties.email_otp;

    const delivery = await sendTransactionalEmail({
      to: email,
      subject: `${code} is your Swara Ranjana login code`,
      html: loginEmailHtml(code),
      text: [
        "Swara Ranjana — My Tickets",
        "",
        `Your one-time login code is: ${code}`,
        "",
        "Enter this code to securely open your ticket account.",
        "If you did not request this code, ignore this email.",
      ].join("\n"),
    });

    if (!delivery.ok) {
      console.error(
        "Customer OTP email delivery failed:",
        delivery.error,
      );
      return {
        ok: false,
        message:
          "We couldn't send a login code right now. Please try again.",
      };
    }

    return {
      ok: true,
      message:
        "If this email is linked to a reservation, a login code has been sent.",
    };
  } catch (error) {
    console.error("Customer OTP request failed:", error);
    return {
      ok: false,
      message:
        "Login is temporarily unavailable. Please try again.",
    };
  }
}

export async function verifyCustomerLoginCode(
  emailInput: string,
  tokenInput: string,
): Promise<AccountAuthResult> {
  const email = emailOf(emailInput);
  const token = tokenInput.replace(/\s+/g, "").trim();

  if (
    !email ||
    token.length < 6 ||
    token.length > 8 ||
    !/^\d+$/.test(token)
  ) {
    return {
      ok: false,
      message: "Enter the code from your email.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "magiclink",
  });

  if (error || !data.user) {
    console.error("Customer OTP verification failed:", error);
    return {
      ok: false,
      message:
        "That code is invalid or has expired. Request a new one.",
    };
  }

  const { error: claimError } = await supabase.rpc(
    "claim_customer_account",
    {},
  );

  if (claimError) {
    console.error("Customer account claim failed:", claimError);
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "We couldn't link this login to a ticket account. Use the same email as your reservation.",
    };
  }

  return {
    ok: true,
    message: "Signed in.",
  };
}

type CustomerOrderRpcResponse = {
  data: Json | null;
  error: { message?: string } | null;
};

function isJsonRecord(
  value: Json | null,
): value is Record<string, Json | undefined> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function requestCustomerOrderAction(
  orderId: string,
  reason = "",
): Promise<CustomerOrderActionResult> {
  if (!orderId) {
    return { ok: false, message: "Order not found." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false,
        message: "Your session has expired. Sign in again to continue.",
      };
    }

    const admin = createAdminClient();

    // Keep the Supabase client as `this`. Detaching admin.rpc causes
    // SupabaseClient.rpc() to crash while trying to read `this.rest`.
    const rpc = admin.rpc.bind(admin) as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<CustomerOrderRpcResponse>;

    const { data, error } = await rpc("customer_order_action_server", {
      p_auth_user_id: user.id,
      p_order_id: orderId,
      p_reason: reason.trim() || null,
    });

    if (error || !isJsonRecord(data) || data.ok !== true) {
      const message =
        isJsonRecord(data) && typeof data.message === "string"
          ? data.message
          : error?.message || "This ticket action could not be completed.";

      return { ok: false, message };
    }

    const rawAction =
      typeof data.action === "string" ? data.action : undefined;
    const action =
      rawAction === "CANCELLED" ||
      rawAction === "CANCEL_REQUESTED" ||
      rawAction === "REFUND_REQUESTED"
        ? rawAction
        : undefined;

    revalidatePath("/account");
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return {
      ok: true,
      action,
      message:
        typeof data.message === "string"
          ? data.message
          : "Your request has been received.",
    };
  } catch (error) {
    console.error("Customer order action crashed:", error);
    return {
      ok: false,
      message:
        "This ticket action could not be completed. Refresh your account and try again.",
    };
  }
}

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}
