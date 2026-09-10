import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerTicketBundle } from "@/lib/account/data";
import { requireCustomer } from "@/lib/auth/requireCustomer";
import AccountTicketViewer from "@/public-site/components/account/AccountTicketViewer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ticket — Swara Ranjana",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  referrer: "no-referrer",
};

export default async function CustomerOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{
    ticket?: string | string[];
  }>;
}) {
  const { orderId } = await params;
  const query = await searchParams;
  const requestedTicket = Array.isArray(query.ticket)
    ? query.ticket[0]
    : query.ticket;

  const { supabase, customer } = await requireCustomer();
  const bundle = await getCustomerTicketBundle(
    supabase,
    customer,
    orderId,
  );

  if (!bundle) notFound();

  const initialTicketId = bundle.tickets.some(
    (ticket) => ticket.id === requestedTicket,
  )
    ? requestedTicket
    : undefined;

  return (
    <main className="min-h-screen bg-[#F7F9FA] px-4 py-10 text-[#0E1721] sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex justify-between">
          <Link
            href="/account"
            className="text-xs uppercase tracking-[.18em] text-[#7D8A95] hover:text-[#2271B1]"
          >
            ← My account
          </Link>
          <span className="text-xs text-[#7D8A95]">
            {bundle.eventName}
          </span>
        </div>

        <AccountTicketViewer
          bundle={bundle}
          initialTicketId={initialTicketId}
        />
      </div>
    </main>
  );
}
