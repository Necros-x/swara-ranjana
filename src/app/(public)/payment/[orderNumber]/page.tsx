import Link from "next/link";
import { notFound } from "next/navigation";
import SlipPaymentPageClient from "@/public-site/components/payment/SlipPaymentPageClient";
import { getGuestPaymentOrder } from "@/lib/payment/order";
import { getBankTransferDetails } from "@/lib/payment/bankTransfer";

export const metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderNumber } = await params;
  const { token } = await searchParams;
  if (!token) notFound();

  const order = await getGuestPaymentOrder(orderNumber, token);
  if (!order) notFound();

  const bankTransfer = await getBankTransferDetails();

  return (
    <>
      <div className="bg-[#F7F9FA] px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto max-w-5xl border border-[#C2CBD2]/70 bg-white px-5 py-4 sm:px-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2271B1]">
            Refund & cancellation policy
          </div>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed text-[#5F6D79] sm:text-sm">
            Online refund and cancellation requests close exactly 48 hours before
            showtime. If you need urgent help after the cutoff,{" "}
            <Link
              href="/contact"
              className="cursor-pointer font-medium text-[#2271B1] hover:underline"
            >
              contact Swara Ranjana support
            </Link>
            .
          </p>
        </div>
      </div>
      <SlipPaymentPageClient
        order={order}
        accessToken={token}
        bankTransfer={bankTransfer}
      />
    </>
  );
}
