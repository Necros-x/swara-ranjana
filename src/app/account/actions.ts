"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface AccountAuthResult { ok: boolean; message: string; }

function emailOf(value: string) { return value.trim().toLowerCase(); }

export async function requestCustomerLoginCode(emailInput: string): Promise<AccountAuthResult> {
  const email = emailOf(emailInput);
  if (email.length < 5 || email.length > 254 || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  try {
    const admin = createAdminClient();
    const { data: customer, error: lookupError } = await admin
      .from("customers").select("id").ilike("email", email).maybeSingle();

    if (lookupError) {
      console.error("Customer account lookup failed:", lookupError);
      return { ok: false, message: "Login is temporarily unavailable. Please try again." };
    }

    // Do not create Auth users for arbitrary email addresses. Keep the public
    // response generic so this cannot be used to enumerate customer emails.
    if (!customer) {
      return { ok: true, message: "If this email is linked to a reservation, a login code has been sent." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      console.error("Customer OTP request failed:", error);
      const rateLimited = error.message.toLowerCase().includes("rate");
      return {
        ok: false,
        message: rateLimited
          ? "Please wait a moment before requesting another code."
          : "We couldn't send a login code right now. Please try again.",
      };
    }

    return { ok: true, message: "If this email is linked to a reservation, a login code has been sent." };
  } catch (error) {
    console.error("Customer OTP request failed:", error);
    return { ok: false, message: "Login is temporarily unavailable. Please try again." };
  }
}

export async function verifyCustomerLoginCode(emailInput: string, tokenInput: string): Promise<AccountAuthResult> {
  const email = emailOf(emailInput);
  const token = tokenInput.replace(/\\s+/g, "").trim();
  if (!email || token.length < 6 || token.length > 8 || !/^\\d+$/.test(token)) {
    return { ok: false, message: "Enter the code from your email." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) {
    return { ok: false, message: "That code is invalid or has expired. Request a new one." };
  }

  const { error: claimError } = await supabase.rpc("claim_customer_account", {});
  if (claimError) {
    console.error("Customer account claim failed:", claimError);
    await supabase.auth.signOut();
    return { ok: false, message: "We couldn't link this login to a ticket account. Use the same email as your reservation." };
  }

  return { ok: true, message: "Signed in." };
}

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}
