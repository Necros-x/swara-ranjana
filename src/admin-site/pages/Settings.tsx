"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  KeyRound,
  Mail,
  ShieldCheck,
  Ticket,
  Upload,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin-site/components/ui/Card";

function StatusRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#C2CBD2]/35 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="text-xs font-medium text-[#31465A]">{label}</div>
      <div className="sm:max-w-[65%] sm:text-right">
        <div className="text-sm font-semibold text-[#0E1721]">{value}</div>
        {note && (
          <div className="mt-1 text-xs leading-relaxed text-[#7D8A95]">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2271B1]">
          System configuration
        </div>
        <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">
          Settings & launch status
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#7D8A95]">
          This page shows the configuration that is actually enforced by the
          live system. Event and ticket data are edited in their dedicated
          admin areas; server secrets and provider credentials are never
          exposed here.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#2271B1]" />
              <div>
                <CardTitle className="text-lg">Event & ticket catalog</CardTitle>
                <CardDescription>
                  Production content is managed from the live database.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StatusRow
              label="Event configuration"
              value="Manage in Events"
              note="Venue, schedule, capacity, status and public web-ticketing state belong to each event."
            />
            <StatusRow
              label="Ticket categories"
              value="Manage in Ticket Types"
              note="Price, category capacity, sale window, per-order maximum and seat-block mapping are category-specific."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/admin/events"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0E1721] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2271B1]"
              >
                <CalendarDays className="h-4 w-4" />
                Open Events
              </Link>
              <Link
                href="/admin/ticket-types"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#C2CBD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1]"
              >
                <Ticket className="h-4 w-4" />
                Open Ticket Types
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#2271B1]" />
              <div>
                <CardTitle className="text-lg">Checkout rules</CardTitle>
                <CardDescription>
                  Enforced server-side during reservation creation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StatusRow
              label="Reservation hold"
              value="30 minutes"
              note="Expired unpaid reservations are cancelled by the scheduled expiry workflow and their physical seats are released."
            />
            <StatusRow
              label="Seat selection"
              value="Automatic allocation"
              note="Customers choose only a ticket category and quantity. Exact physical seats are assigned by the server."
            />
            <StatusRow
              label="Per-order limit"
              value="Defined by each ticket category"
              note="The live categories currently enforce their own max-per-order value rather than one global mock setting."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <WalletCards className="h-5 w-5 text-[#2271B1]" />
              <div>
                <CardTitle className="text-lg">Payment workflows</CardTitle>
                <CardDescription>
                  Payment collection and gate admission remain separate.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StatusRow
              label="Card"
              value="Gateway connection pending"
              note="Card details must only be entered on the future hosted OnePay checkout. Raw card data is never collected by this site."
            />
            <StatusRow
              label="Pay on arrival"
              value="Active"
              note="Staff record payment at the Payment Counter; the gate scanner performs admission afterwards."
            />
            <StatusRow
              label="Bank slip"
              value="Upload & review workflow active"
              note="Production bank-transfer instructions still require confirmed event banking details before public launch."
            />
            <Link
              href="/admin/payment-counter"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#C2CBD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1]"
            >
              <CreditCard className="h-4 w-4" />
              Open Payment Counter
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#2271B1]" />
              <div>
                <CardTitle className="text-lg">Email & authentication</CardTitle>
                <CardDescription>
                  Provider secrets stay in protected server configuration.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StatusRow
              label="Transactional email"
              value="Resend integration"
              note="Sender credentials come from server environment variables. Unconfirmed support contact details are not hardcoded into public emails."
            />
            <StatusRow
              label="Customer account"
              value="Passwordless email code"
              note="Customers prove ownership of the reservation email before account orders and QR tickets are displayed."
            />
            <StatusRow
              label="Staff account"
              value="Email + password + active staff profile"
              note="Admin access also requires an ACTIVE staff profile with an authorized role."
            />
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Supabase currently reports leaked-password protection as
                disabled. If the project plan supports it, enable it in the
                Supabase Auth email/password settings before production launch.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-[#2271B1]" />
            <div>
              <CardTitle className="text-lg">Configuration ownership</CardTitle>
              <CardDescription>
                Where each production setting should be changed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-xs leading-relaxed text-[#5F6D79] sm:grid-cols-3">
          <div className="rounded-lg border border-[#C2CBD2]/50 bg-[#F8FAFB] p-4">
            <div className="font-semibold text-[#0E1721]">Database catalog</div>
            <p className="mt-2">
              Event, ticket-category, capacity and seat-block data belong in
              the admin Events and Ticket Types workflows.
            </p>
          </div>
          <div className="rounded-lg border border-[#C2CBD2]/50 bg-[#F8FAFB] p-4">
            <div className="font-semibold text-[#0E1721]">Server environment</div>
            <p className="mt-2">
              Resend, Supabase service credentials and future payment-gateway
              secrets stay in protected deployment environment variables.
            </p>
          </div>
          <div className="rounded-lg border border-[#C2CBD2]/50 bg-[#F8FAFB] p-4">
            <div className="font-semibold text-[#0E1721]">Public content</div>
            <p className="mt-2">
              Artist, programme, gallery, banking and official contact details
              must only be published after the event team confirms them.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-[#2271B1]/20 bg-[#2271B1]/5 p-4 text-xs leading-relaxed text-[#31465A]">
        <Upload className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
        There is intentionally no generic “Save Settings” button here. The old
        screen contained mock values that were not connected to production
        configuration.
      </div>
    </div>
  );
}
