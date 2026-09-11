"use client";

import { useState, useTransition } from "react";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import {
  requestCustomerLoginCode,
  verifyCustomerLoginCode,
} from "@/app/account/actions";

export default function AccountLoginClient() {
  const [step, setStep] = useState<"EMAIL" | "CODE">("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const request = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await requestCustomerLoginCode(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setMessage(result.message);
      setStep("CODE");
    });
  };

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await verifyCustomerLoginCode(email, code);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      window.location.assign("/account");
    });
  };

  const resend = () => {
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await requestCustomerLoginCode(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setMessage("A new login code has been sent.");
    });
  };

  return (
    <div className="w-full max-w-md border border-[#C2CBD2]/70 bg-white p-7 shadow-[0_24px_80px_rgba(14,23,33,.08)] sm:p-9">
      <div className="text-[10px] font-mono uppercase tracking-[.3em] text-[#2271B1]">
        Customer account
      </div>
      <h1 className="mt-3 font-gemola text-4xl">My tickets.</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#7D8A95]">
        Use the same email address you used when reserving. No password is
        required.
      </p>

      {step === "EMAIL" ? (
        <form onSubmit={request} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[.18em] text-[#7D8A95]">
              Reservation email
            </span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full border border-[#C2CBD2] pl-11 pr-4 text-sm outline-none focus:border-[#2271B1]"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#0E1721] text-xs font-bold uppercase tracking-[.18em] text-white hover:bg-[#2271B1] disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            {pending ? "Sending…" : "Send login code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[.18em] text-[#7D8A95]">
              Code sent for
            </div>
            <div className="mt-1 text-sm font-medium text-[#31465A]">
              {email}
            </div>
          </div>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 8));
              setError("");
            }}
            placeholder="000000"
            className="h-14 w-full border border-[#C2CBD2] px-4 text-center font-mono text-2xl tracking-[.35em] outline-none focus:border-[#2271B1]"
          />
          <button
            type="submit"
            disabled={pending || code.length < 6}
            className="h-12 w-full bg-[#0E1721] text-xs font-bold uppercase tracking-[.18em] text-white hover:bg-[#2271B1] disabled:opacity-50"
          >
            {pending ? "Checking…" : "View my tickets"}
          </button>
          <div className="flex justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setCode("");
                setError("");
                setMessage("");
              }}
              className="text-[#7D8A95] hover:text-[#2271B1]"
            >
              Change email
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={resend}
              className="text-[#31465A] hover:text-[#2271B1] disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      {message && (
        <div className="mt-5 border border-[#2271B1]/20 bg-[#2271B1]/5 p-3 text-xs text-[#31465A]">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-5 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-7 flex items-start gap-3 border-t border-[#C2CBD2]/60 pt-5 text-[11px] leading-relaxed text-[#7D8A95]">
        <ShieldCheck className="mt-.5 h-4 w-4 shrink-0 text-[#2271B1]" />
        The code proves ownership of your reservation email before orders and
        QR tickets are shown.
      </div>
    </div>
  );
}
