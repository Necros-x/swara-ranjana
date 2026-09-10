import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuestTicketBundle } from "@/lib/tickets/guest";
import DigitalTicketsClient from "@/public-site/components/tickets/DigitalTicketsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Digital Tickets — Swara Ranjana",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  referrer: "no-referrer",
};

export default async function DigitalTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;

  if (!token) notFound();

  const bundle = await getGuestTicketBundle(orderNumber, token);
  if (!bundle) notFound();

  return <DigitalTicketsClient bundle={bundle} accessToken={token} />;
}
