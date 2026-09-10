"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email/resend";

export interface AccountAuthResult {
  ok: boolean;
  message: string;
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
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FEFFFF;border:1px solid #d8dee3;">
            <tr>
              <td style="padding:28px;border-bottom:1px solid #e4e8eb;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#0E1721;">
                  SWARA RANJANA
                </div>
                <div style="margin-top:8px;font-size:10px;line-height:1.4;color:#2271B1;letter-spacing:3px;text-transform:uppercase;">
                  My Tickets
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

    // Keep the same response for unknown addresses so the endpoint cannot be
    // used to discover which emails have reservations.
    if (!customer) {
      return {
        ok: true,
        message:
          "If this email is linked to a reservation, a login code has been sent.",
      };
    }

    // Generate the Supabase Auth OTP without asking Supabase's mailer to send
    // anything. We deliver the raw OTP through the same Resend integration
    // used by reservation/ticket emails.
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData?.properties?.email_otp) {
      console.error(
        "Customer OTP generation failed:",
        linkError,
      );
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
    console.error(
      "Customer account claim failed:",
      claimError,
    );
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

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}