import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type CustomerProfile = Pick<
  Tables<"customers">,
  "id" | "full_name" | "email" | "phone" | "auth_user_id"
>;

export async function getCurrentCustomer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: customer } = await supabase
    .from("customers")
    .select("id,full_name,email,phone,auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!customer && user.email) {
    const { error } = await supabase.rpc("claim_customer_account", {});
    if (!error) {
      const retry = await supabase
        .from("customers")
        .select("id,full_name,email,phone,auth_user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      customer = retry.data;
    }
  }

  if (!customer) return null;
  return { supabase, user, customer: customer as CustomerProfile };
}

export async function requireCustomer() {
  const current = await getCurrentCustomer();
  if (!current) redirect("/account/login");
  return current;
}
