import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  KeyRound,
  Mail,
  Save,
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
import { saveBankTransferSettings } from "@/app/admin/actions/settings";
import type { BankTransferDetails } from "@/lib/payment/bankTransfer";

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

export default function Settings({
  bankTransfer,
  success,
  error,
}: {
  bankTransfer: BankTransferDetails | null;
  success?: string;
  error?: string;
}) {
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
          Operational settings live here. Provider credentials and Supabase
          secrets remain protected server-side and are never exposed in this
          screen.
        </p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Upload className="mt-0.5 h-5 w-5 text-[#2271B1]" />
            <div>
              <CardTitle className="text-lg">Bank transfer instructions</CardTitle>
              <CardDescription>
                These details are shown to customers after they select Slip Upload.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={saveBankTransferSettings} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Bank name</span>
                <input
                  name="bankName"
                  required
                  defaultValue={bankTransfer?.bankName ?? ""}
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 text-sm text-[#0E1721] outline-none transition focus:border-[#2271B1]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Branch</span>
                <input
                  name="branch"
                  defaultValue={bankTransfer?.branch ?? ""}
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 text-sm text-[#0E1721] outline-none transition focus:border-[#2271B1]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Account name</span>
                <input
                  name="accountName"
                  required
                  defaultValue={bankTransfer?.accountName ?? ""}
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 text-sm text-[#0E1721] outline-none transition focus:border-[#2271B1]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Account number</span>
                <input
                  name="accountNumber"
                  required
                  defaultValue={bankTransfer?.accountNumber ?? ""}
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 font-mono text-sm text-[#0E1721] outline-none transition focus:border-[#2271B1]"
                />
              </label>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <input
                type="checkbox"
                name="isMock"
                defaultChecked={bankTransfer?.isMock ?? true}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                <span className="block text-xs font-semibold text-amber-900">
                  Mark these as demo / testing details
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-amber-800">
                  When enabled, checkout clearly warns customers not to make a real
                  transfer. Turn this off only after the event team provides the
                  official account.
                </span>
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0E1721] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#2271B1]"
            >
              <Save className="h-4 w-4" />
              Save bank details
            </button>
          </form>
        </CardContent>
      </Card>

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
              note="Price, capacity, sale window, per-order maximum and seat-block mapping are category-specific."
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
                  New public reservations use slip upload until the card gateway is connected.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StatusRow
              label="Card"
              value="Gateway connection pending"
              note="OnePay will use hosted checkout; raw card details are never collected by this site."
            />
            <StatusRow
              label="Slip upload"
              value="Active"
              note="Customers see the bank details above, upload proof, and staff approve or reject it from the order workflow."
            />
            <StatusRow
              label="Pay on arrival"
              value="Removed from new checkout"
              note="The legacy Payment Counter remains available only for previously created On-Arrival reservations."
            />
            <Link
              href="/admin/payment-counter"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#C2CBD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1]"
            >
              <CreditCard className="h-4 w-4" />
              Legacy Payment Counter
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
            />
            <StatusRow
              label="Customer account"
              value="Passwordless email code"
            />
            <StatusRow
              label="Staff account"
              value="Email + password + active staff profile"
            />
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#C2CBD2]/60 bg-[#F8FAFB] p-4 text-xs leading-relaxed text-[#5F6D79]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
              <span>
                Supabase leaked-password protection is not available on the current
                project plan. This is a plan limitation rather than an outstanding
                launch task for this deployment.
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
              <CardDescription>Where production settings are changed.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-xs leading-relaxed text-[#5F6D79] sm:grid-cols-3">
          <div className="rounded-lg border border-[#C2CBD2]/50 bg-[#F8FAFB] p-4">
            <div className="font-semibold text-[#0E1721]">Admin portal</div>
            <p className="mt-2">Bank transfer instructions, events, categories, staff and operational data are managed here.</p>
          </div>
          <div className="rounded-lg border border-[#C2CBD2]/50 bg-[#F8FAFB] p-4">
            <div className="font-semibold text-[#0E1721]">Server environment</div>
            <p className="mt-2">Resend, Supabase service credentials and future payment-gateway secrets stay in protected deployment variables.</p>
          </div>
          <div className="rounded-lg border border-[#C2CBD2]/50 bg-[#F8FAFB] p-4">
            <div className="font-semibold text-[#0E1721]">Public content</div>
            <p className="mt-2">Artists, programme, gallery and official contact content publish only after confirmation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
