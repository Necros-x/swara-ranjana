"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/admin-site/components/ui/Button";
import { Input } from "@/admin-site/components/ui/Input";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StaffRole } from "@/types/database";

const SCANNER_ALLOWED_PATHS = [
  "/admin/scanner",
  "/admin/scan-history",
  "/admin/payment-counter",
  "/admin/customers",
  "/admin/profile",
];

function defaultPathForRole(role: StaffRole) {
  return role === "SCANNER" ? "/admin/scanner" : "/admin/dashboard";
}

function resolveNextPath(nextPath: string | undefined, role: StaffRole) {
  const fallback = defaultPathForRole(role);
  if (!nextPath?.startsWith("/admin/")) return fallback;

  if (role !== "SCANNER") return nextPath;

  return SCANNER_ALLOWED_PATHS.some(
    (path) => nextPath === path || nextPath.startsWith(`${path}/`),
  )
    ? nextPath
    : fallback;
}

export default function Login({
  nextPath,
  initialError,
  initialSuccess,
}: {
  nextPath?: string;
  initialError?: string;
  initialSuccess?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Unable to verify this session.");

      const { data: profile, error: profileError } = await supabase
        .from("staff_profiles")
        .select("role, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.status !== "ACTIVE") {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized for the admin portal.");
      }

      router.replace(resolveNextPath(nextPath, profile.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FEFFFF]">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#0E1721] lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #2271B1 0%, transparent 60%)",
          }}
        />
        <div className="absolute h-96 w-96 rotate-45 transform rounded-full border border-[#31465A]/30" />
        <div className="absolute h-[30rem] w-[30rem] -rotate-12 transform rounded-full border border-[#31465A]/20" />

        <div className="z-10 px-12 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-[#FEFFFF]/20 bg-[#FEFFFF]/10 backdrop-blur-sm">
            <span className="s3">
              <img src="/brand/favicon.ico" alt="Swara Ranjana" />
            </span>
          </div>
          <h1 className="mb-4 font-gemola text-4xl font-light tracking-wide text-[#FEFFFF]">
            SWARA RANJANA
          </h1>
          <p className="mx-auto max-w-sm font-light text-[#C2CBD2]">
            Secure concert administration, ticketing and entrance operations.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2 lg:p-24">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="mb-2 font-gemola text-3xl font-light uppercase tracking-tight text-[#0E1721]">
              Swara Ranjana
            </h2>
            <h3 className="text-sm font-light uppercase tracking-widest text-[#31465A]">
              Administration
            </h3>
          </div>

          {initialSuccess && (
            <div
              className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              role="status"
            >
              {initialSuccess}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="text-sm font-medium text-[#0E1721]"
              >
                Email Address
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium text-[#0E1721]"
                >
                  Password
                </label>
                <span className="text-xs text-[#7D8A95]">Staff access only</span>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-0 top-0 flex h-11 w-11 cursor-pointer items-center justify-center text-[#7D8A95] transition-colors hover:text-[#2271B1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2271B1]/30"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full cursor-pointer text-base font-medium disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing In…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-[#7D8A95]">
            Secure access restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
