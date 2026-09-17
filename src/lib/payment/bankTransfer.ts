import "server-only";

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string | null;
}

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getBankTransferDetails(): BankTransferDetails | null {
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
  };
}

export function isBankTransferConfigured() {
  return getBankTransferDetails() !== null;
}
