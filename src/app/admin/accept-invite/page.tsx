import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { completeStaffInvite } from "@/app/admin/actions/staff";

export const metadata: Metadata = {
  title: "Staff Setup",
  robots: { index: false, follow: false, nocache: true },
};

export default async function StaffInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const params = await searchParams;
  const email = params.email?.trim() ?? "";

  return (
    <main className="min-h-screen bg-[#F7F9FA] px-4 py-12 text-[#0E1721] sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/admin/login"
          className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7D8A95] hover:text-[#2271B1]"
        >
          ← Admin login
        </Link>

        <div className="mt-6 border border-[#C2CBD2]/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2271B1]/10 text-[#2271B1]">
            <KeyRound className="h-5 w-5" />
          </div>

          <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2271B1]">
            Staff Portal
          </div>
          <h1 className="mt-2 font-gemola text-3xl">Finish staff setup.</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6E7B86]">
            Enter the email address and one-time code from your Swara Ranjana
            staff invitation, then choose the password you will use at admin
            login.
          </p>

          {params.error && (
            <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error}
            </div>
          )}

          <form action={completeStaffInvite} className="mt-6 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">Email</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={email}
                autoComplete="email"
                className="h-11 w-full border border-[#C2CBD2] bg-white px-3 text-sm outline-none transition focus:border-[#2271B1]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">
                One-time setup code
              </span>
              <input
                name="code"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={6}
                maxLength={8}
                required
                autoComplete="one-time-code"
                className="h-11 w-full border border-[#C2CBD2] bg-white px-3 font-mono text-lg tracking-[0.25em] outline-none transition focus:border-[#2271B1]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">Password</span>
              <input
                name="password"
                type="password"
                minLength={10}
                required
                autoComplete="new-password"
                className="h-11 w-full border border-[#C2CBD2] bg-white px-3 text-sm outline-none transition focus:border-[#2271B1]"
              />
              <span className="block text-[10px] text-[#7D8A95]">
                Use at least 10 characters.
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#31465A]">
                Confirm password
              </span>
              <input
                name="confirmPassword"
                type="password"
                minLength={10}
                required
                autoComplete="new-password"
                className="h-11 w-full border border-[#C2CBD2] bg-white px-3 text-sm outline-none transition focus:border-[#2271B1]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-[#0E1721] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#2271B1]"
            >
              <ShieldCheck className="h-4 w-4" />
              Activate staff account
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
