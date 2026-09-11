import Link from "next/link";
import { notFound } from "next/navigation";
import PaymentPageClient from "@/public-site/components/payment/PaymentPageClient";
import { getGuestPaymentOrder } from "@/lib/payment/order";

export const metadata = {
  title: "Payment | Swara Ranjana 2026",
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

  return (
    <>
      <div className="bg-[#F7F9FA] px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto max-w-5xl border border-[#C2CBD2]/70 bg-white px-5 py-4 sm:px-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2271B1]">
            Refund & cancellation policy
          </div>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed text-[#5F6D79] sm:text-sm">
            Online refund and cancellation requests close exactly 48 hours before showtime. If you need urgent help after the cutoff, {" "}
            <Link href="/contact" className="font-medium text-[#2271B1] hover:underline">
              contact the Box Office
            </Link>
            , email {" "}
            <a
              href="mailto:concierge@swararanjana.lk"
              className="font-medium text-[#2271B1] hover:underline"
            >
              concierge@swararanjana.lk
            </a>
            {" "}or call {" "}
            <a
              href="tel:+94112689000"
              className="font-medium text-[#2271B1] hover:underline"
            >
              +94 11 268 9000
            </a>
            .
          </p>
        </div>
      </div>
      <PaymentPageClient order={order} accessToken={token} />
    </>
  );
}
