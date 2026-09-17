import Settings from "@/admin-site/pages/Settings";
import { requireStaff } from "@/lib/auth/requireStaff";
import { getBankTransferDetails } from "@/lib/payment/bankTransfer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await requireStaff(["SUPER_ADMIN", "ADMIN"]);
  const bankTransfer = await getBankTransferDetails();
  const params = await searchParams;

  return (
    <Settings
      bankTransfer={bankTransfer}
      success={params.success}
      error={params.error}
    />
  );
}
