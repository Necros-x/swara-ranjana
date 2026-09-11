import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CreditCard, LogOut, MapPin, Ticket } from "lucide-react";
import { signOutCustomer } from "@/app/account/actions";
import { getCustomerAccountData } from "@/lib/account/data";
import { requireCustomer } from "@/lib/auth/requireCustomer";
import AccountOrderActions from "@/public-site/components/account/AccountOrderActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "My Tickets — Swara Ranjana",
  robots: { index: false, follow: false, nocache: true },
};

function date(value: string, timezone = "Asia/Colombo") {
  if (!value) return "Date TBA";
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function payment(method: string | null) {
  if (method === "ON_ARRIVAL") return "Pay on arrival";
  if (method === "BANK_SLIP") return "Bank transfer";
  if (method === "CARD") return "Card / OnePay";
  return "Payment not selected";
}

export default async function AccountPage() {
  const { supabase, customer } = await requireCustomer();
  const account = await getCustomerAccountData(supabase, customer);

  return (
    <main className="min-h-screen bg-[#F7F9FA] px-4 py-10 text-[#0E1721] sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 border-b border-[#C2CBD2] pb-6 sm:flex-row sm:items-end">
          <div>
            <Link href="/" className="text-[10px] uppercase tracking-[.2em] text-[#7D8A95] hover:text-[#2271B1]">← Swara Ranjana</Link>
            <div className="mt-5 text-[10px] font-mono uppercase tracking-[.3em] text-[#2271B1]">Customer profile</div>
            <h1 className="mt-2 font-gemola text-4xl sm:text-5xl">My tickets.</h1>
            <p className="mt-2 text-sm text-[#7D8A95]">{customer.full_name} • {customer.email}</p>
          </div>
          <form action={signOutCustomer}>
            <button type="submit" className="inline-flex h-10 items-center gap-2 border border-[#C2CBD2] bg-white px-4 text-xs text-[#31465A] hover:border-[#2271B1] hover:text-[#2271B1]"><LogOut className="h-4 w-4" />Sign out</button>
          </form>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[270px_1fr]">
          <aside className="h-fit border border-[#C2CBD2]/70 bg-white p-5">
            <div className="text-[10px] uppercase tracking-[.18em] text-[#7D8A95]">Account</div>
            <div className="mt-4 space-y-4 text-sm">
              <div><div className="text-[10px] uppercase text-[#7D8A95]">Name</div><div className="mt-1 font-medium">{customer.full_name}</div></div>
              <div><div className="text-[10px] uppercase text-[#7D8A95]">Email</div><div className="mt-1 break-all text-[#31465A]">{customer.email}</div></div>
              <div><div className="text-[10px] uppercase text-[#7D8A95]">Phone</div><div className="mt-1 text-[#31465A]">{customer.phone || "—"}</div></div>
            </div>
            <div className="mt-6 border-t border-[#C2CBD2]/60 pt-5 text-xs leading-relaxed text-[#7D8A95]">Future reservations using this same email appear here automatically.</div>
          </aside>

          <section className="min-w-0">
            <div className="flex items-end justify-between gap-4">
              <div><div className="text-[10px] uppercase tracking-[.18em] text-[#7D8A95]">Reservations & admissions</div><h2 className="mt-1 font-gemola text-3xl">Orders</h2></div>
              <Link href="/tickets" className="shrink-0 text-xs text-[#2271B1] hover:underline">Reserve more →</Link>
            </div>

            {!account.orders.length ? (
              <div className="mt-5 border border-[#C2CBD2] bg-white p-10 text-center"><Ticket className="mx-auto h-6 w-6 text-[#7D8A95]" /><p className="mt-3 text-sm font-medium">No reservations found.</p></div>
            ) : (
              <div className="mt-5 space-y-4">
                {account.orders.map((order) => {
                  const expired = order.status === "PENDING" && !!order.expiresAt && new Date(order.expiresAt).getTime() <= Date.now();
                  const paymentPaid = order.paymentStatus === "PAID";
                  const paymentRefunded = order.paymentStatus.includes("REFUNDED");
                  return (
                    <article key={order.id} className="min-w-0 border border-[#C2CBD2]/70 bg-white p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-[#2271B1]">{order.orderNumber}</div>
                          <h3 className="mt-2 font-gemola text-2xl">{order.eventName}</h3>
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#7D8A95]">
                            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{date(order.eventStartsAt, order.eventTimezone)}</span>
                            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{order.venueName}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-start gap-1.5">
                          <span className="inline-flex items-center border border-[#C2CBD2] px-2 py-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.08em]">{expired ? "EXPIRED" : order.status}</span>
                          <span className={`inline-flex items-center border px-2 py-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.08em] ${paymentPaid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : paymentRefunded ? "border-sky-200 bg-sky-50 text-sky-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{order.paymentStatus.replaceAll("_", " ")}</span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 border-y border-[#C2CBD2]/50 py-4 sm:grid-cols-3">
                        <div><div className="text-[9px] uppercase text-[#7D8A95]">Tickets</div><div className="mt-1 text-sm font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</div></div>
                        <div><div className="text-[9px] uppercase text-[#7D8A95]">Payment</div><div className="mt-1 text-sm font-medium">{payment(order.paymentMethod)}</div></div>
                        <div><div className="text-[9px] uppercase text-[#7D8A95]">Total</div><div className="mt-1 text-sm font-medium">{order.currency} {order.total.toLocaleString("en-LK")}</div></div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-xs"><span>{item.ticketTypeName} × {item.quantity}</span><span className="shrink-0 text-[#7D8A95]">{order.currency} {item.totalPrice.toLocaleString("en-LK")}</span></div>)}
                      </div>

                      {order.slipStatus === "PENDING" && <div className="mt-4 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Your payment slip is awaiting verification.</div>}

                      {order.tickets.length > 0 && (
                        <div className="mt-5">
                          <div className="mb-2 text-[10px] uppercase tracking-[.16em] text-[#7D8A95]">Your issued tickets</div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {order.tickets.map((ticket) => (
                              <Link key={ticket.id} href={`/account/orders/${order.id}?ticket=${encodeURIComponent(ticket.id)}`} className="group flex min-w-0 items-center justify-between gap-3 border border-[#C2CBD2]/70 bg-[#F9FAFB] px-4 py-3 transition hover:border-[#2271B1] hover:bg-white">
                                <div className="min-w-0"><div className="truncate font-mono text-xs font-semibold text-[#0E1721]">{ticket.ticketNumber}</div><div className="mt-1 truncate text-[10px] text-[#7D8A95]">{ticket.ticketTypeName} • {ticket.status}</div></div>
                                <span className="shrink-0 text-[10px] font-medium uppercase tracking-[.14em] text-[#2271B1]">Open →</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        {order.tickets.length > 0 && <Link href={`/account/orders/${order.id}`} className="inline-flex h-10 items-center gap-2 bg-[#0E1721] px-4 text-xs text-white hover:bg-[#2271B1]"><Ticket className="h-4 w-4" />View all {order.tickets.length === 1 ? "ticket" : "tickets"}</Link>}
                        {order.status === "PENDING" && !expired && <Link href={`/payment/${order.orderNumber}?token=${encodeURIComponent(order.accessToken)}`} className="inline-flex h-10 items-center gap-2 border border-[#C2CBD2] px-4 text-xs text-[#31465A] hover:border-[#2271B1] hover:text-[#2271B1]"><CreditCard className="h-4 w-4" />Continue payment</Link>}
                        <AccountOrderActions
                          orderId={order.id}
                          orderStatus={order.status}
                          paymentStatus={order.paymentStatus}
                          paymentMethod={order.paymentMethod}
                          slipStatus={order.slipStatus}
                          eventStartsAt={order.eventStartsAt}
                          pendingRequest={order.pendingRequest}
                          tickets={order.tickets}
                          currency={order.currency}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
