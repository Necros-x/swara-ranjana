import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string | null;
  isMock: boolean;
}

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function fromEnvironment(): BankTransferDetails | null {
  const bankName = env("BANK_TRANSFER_BANK_NAME");
  const accountName = env("BANK_TRANSFER_ACCOUNT_NAME");
  const accountNumber = env("BANK_TRANSFER_ACCOUNT_NUMBER");
  const branch = env("BANK_TRANSFER_BRANCH");

  if (!bankName || !accountName || !accountNumber) return null;

  return {
    bankName,
    accountName,
    accountNumber,
    branch: branch || null,
    isMock: false,
  };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function getBankTransferDetails(): Promise<BankTransferDetails | null> {
  const admin = createAdminClient() as unknown as SupabaseClient;
  const { data, error } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "bank_transfer")
    .maybeSingle();

  if (!error && data?.value && typeof data.value === "object") {
    const value = data.value as Record<string, unknown>;
    const bankName = clean(value.bankName);
    const accountName = clean(value.accountName);
    const accountNumber = clean(value.accountNumber);
    const branch = clean(value.branch);

    if (bankName && accountName && accountNumber) {
      return {
        bankName,
        accountName,
        accountNumber,
        branch: branch || null,
        isMock: value.isMock !== false,
      };
    }
  }

  if (error) {
    console.error("Bank transfer settings lookup failed:", error);
  }

  return fromEnvironment();
}

export async function isBankTransferConfigured() {
  return (await getBankTransferDetails()) !== null;
}
