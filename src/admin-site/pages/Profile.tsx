import { KeyRound, Mail, ShieldCheck, UserCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/admin-site/components/ui/Card";
import {
  updateAdminPassword,
  updateAdminProfile,
} from "@/app/admin/actions/profile";
import type { StaffRole, StaffStatus } from "@/types/database";

function roleLabel(role: StaffRole) {
  if (role === "BOX_OFFICE") return "SWARA RANJANA STAFF";
  return role.replaceAll("_", " ");
}

export default function Profile({
  name,
  email,
  role,
  status,
  success,
  error,
}: {
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  success?: string;
  error?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2271B1]">
          Staff account
        </div>
        <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">Admin profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#7D8A95]">
          Manage your display identity and sign-in password. Role and account
          status are controlled by a super admin.
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
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#C2CBD2]/40 bg-[#F4F7F9] font-gemola text-2xl text-[#31465A]">
            {initials || "SR"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xl font-semibold text-[#0E1721]">{name}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#7D8A95]">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{email}</span>
            </div>
          </div>
          <div className="grid gap-2 text-xs sm:text-right">
            <span className="font-semibold uppercase tracking-[0.12em] text-[#31465A]">
              {roleLabel(role)}
            </span>
            <span className={status === "ACTIVE" ? "text-emerald-700" : "text-red-600"}>
              {status}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-[#2271B1]" />
              <div>
                <CardTitle className="text-lg">Profile details</CardTitle>
                <CardDescription>
                  This name appears throughout the admin portal.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={updateAdminProfile} className="space-y-4">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Display name</span>
                <input
                  name="displayName"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={name}
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 text-sm outline-none transition focus:border-[#2271B1]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Email</span>
                <input
                  value={email}
                  readOnly
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/50 bg-[#F7F9FA] px-3 text-sm text-[#7D8A95]"
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-[#0E1721] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#2271B1]"
              >
                Save profile
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-[#2271B1]" />
              <div>
                <CardTitle className="text-lg">Change password</CardTitle>
                <CardDescription>
                  Use at least 10 characters for staff access.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={updateAdminPassword} className="space-y-4">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">New password</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 text-sm outline-none transition focus:border-[#2271B1]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-[#31465A]">Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-md border border-[#C2CBD2]/70 bg-white px-3 text-sm outline-none transition focus:border-[#2271B1]"
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-[#C2CBD2] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1]"
              >
                Update password
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#2271B1]/20 bg-[#2271B1]/5 p-4 text-xs leading-relaxed text-[#31465A]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
        Role or access-status changes must be made from Staff Management by an
        active super admin.
      </div>
    </div>
  );
}
