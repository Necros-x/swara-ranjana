"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Home,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

export type ErrorExperienceCode = "403" | "404" | "500";

const COPY: Record<
  ErrorExperienceCode,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  "403": {
    eyebrow: "Access restricted",
    title: "This space is not yours to enter.",
    description:
      "Your session is valid, but this area requires a different level of access.",
  },
  "404": {
    eyebrow: "Page not found",
    title: "The note you followed has faded.",
    description:
      "This page may have moved, changed, or never belonged to tonight's programme.",
  },
  "500": {
    eyebrow: "Unexpected interruption",
    title: "The performance paused for a moment.",
    description:
      "Something unexpected interrupted this page. Your reservation and ticket data remain separate from this screen.",
  },
};

export function ErrorExperience({
  code,
  onRetry,
}: {
  code: ErrorExperienceCode;
  onRetry?: () => void;
}) {
  const copy = COPY[code];

  return (
    <main className="relative isolate flex min-h-[calc(100vh-2.25rem)] items-center overflow-hidden bg-[#FEFFFF] px-5 py-20 text-[#0E1721] sm:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-[#2271B1]/10" />
        <div className="absolute -right-4 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full border border-[#C2CBD2]/60" />
        <div className="absolute left-[8%] top-[14%] h-28 w-28 rounded-full bg-[#2271B1]/5 blur-3xl" />
        <div className="absolute bottom-[12%] right-[20%] h-40 w-40 rounded-full bg-[#31465A]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <section className="max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#2271B1]">
            Swara Ranjana • {copy.eyebrow}
          </div>

          <div className="mt-6 flex items-start gap-5 sm:gap-7">
            <div className="font-gemola text-[clamp(4.8rem,16vw,9rem)] font-light leading-[0.72] tracking-[-0.06em] text-[#0E1721]">
              {code}
            </div>
            <div className="mt-1 hidden h-px flex-1 bg-[#C2CBD2] sm:block" />
          </div>

          <h1 className="mt-8 max-w-xl font-gemola text-4xl font-light leading-[0.95] tracking-[-0.035em] sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#7D8A95] sm:text-[15px]">
            {copy.description}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-11 items-center gap-2 bg-[#0E1721] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#2271B1]"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Try again
              </button>
            )}

            <Link
              href="/"
              className={`inline-flex min-h-11 items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                onRetry
                  ? "border border-[#C2CBD2] text-[#31465A] hover:border-[#2271B1] hover:text-[#2271B1]"
                  : "bg-[#0E1721] text-white hover:bg-[#2271B1]"
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              Return home
            </Link>

            {code === "403" && (
              <Link
                href="/admin/login"
                className="inline-flex min-h-11 items-center gap-2 border border-[#C2CBD2] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#31465A] transition-colors hover:border-[#2271B1] hover:text-[#2271B1]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Admin sign in
              </Link>
            )}
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="relative grid h-72 w-72 place-items-center rounded-full border border-[#C2CBD2]/70">
            <div className="absolute inset-7 rounded-full border border-[#2271B1]/20" />
            <div className="absolute inset-16 rounded-full bg-[#2271B1]/[0.045] blur-xl" />
            <ShieldAlert className="relative h-12 w-12 stroke-[1.2] text-[#2271B1]" />
          </div>
        </aside>
      </div>
    </main>
  );
}
