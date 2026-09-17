"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  ImageIcon,
  ShieldCheck,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import {
  type DragEvent,
  type FormEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  selectPaymentMethod,
  uploadPaymentSlip,
} from "@/app/actions/payment";
import {
  MAX_FINAL_SLIP_BYTES,
  MAX_SOURCE_SLIP_BYTES,
  preparePaymentSlip,
} from "@/lib/payment/compressSlip";
import type { BankTransferDetails } from "@/lib/payment/bankTransfer";
import type { GuestPaymentOrder } from "@/lib/payment/order";

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function SlipPaymentPageClient({
  order,
  accessToken,
  bankTransfer,
}: {
  order: GuestPaymentOrder;
  accessToken: string;
  bankTransfer: BankTransferDetails | null;
}) {
  const [method, setMethod] = useState<"CARD" | "BANK_SLIP">(
    order.paymentMethod === "BANK_SLIP" ? "BANK_SLIP" : "CARD",
  );
  const [message, setMessage] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const expired =
    order.status === "PENDING" &&
    !!order.expiresAt &&
    new Date(order.expiresAt).getTime() <= Date.now();

  const chooseSlip = () => {
    if (!bankTransfer) {
      setMessage("Bank transfer details are not configured yet.");
      return;
    }

    setMethod("BANK_SLIP");
    setMessage("");

    startTransition(async () => {
      const result = await selectPaymentMethod(
        order.orderNumber,
        accessToken,
        "BANK_SLIP",
      );
      if (!result.ok) {
        setMessage(result.message || "Unable to select slip upload.");
      }
    });
  };

  const prepareSlip = async (candidate?: File | null) => {
    if (!candidate) return;

    setMessage("");
    setSlip(null);
    setOptimizing(true);

    try {
      const prepared = await preparePaymentSlip(candidate);
      setSlip(prepared);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to prepare this payment slip.",
      );
    } finally {
      setOptimizing(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void prepareSlip(event.dataTransfer.files?.[0]);
  };

  const submitSlip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slip) {
      setMessage("Choose a payment slip first.");
      return;
    }

    setMessage("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderNumber", order.orderNumber);
      formData.set("accessToken", accessToken);
      formData.set("slip", slip);

      const result = await uploadPaymentSlip(formData);
      if (result.ok) location.reload();
      else setMessage(result.message || "Unable to upload slip.");
    });
  };

  return (
    <main className="min-h-screen bg-[#FEFFFF] px-4 py-12 text-[#0E1721]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/tickets"
          className="text-xs uppercase tracking-[.2em] text-[#7D8A95] hover:text-[#0E1721]"
        >
          ← Back to tickets
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <span className="font-mono text-[10px] uppercase tracking-[.3em] text-[#2271B1]">
              Secure Checkout
            </span>
            <h1 className="mt-2 font-gemola text-4xl sm:text-5xl">
              Choose payment.
            </h1>
            <p className="mt-3 text-sm text-[#7D8A95]">
              Order {order.orderNumber}
            </p>

            {order.status === "CONFIRMED" ? (
              <div className="mt-8 rounded-sm border border-emerald-200 bg-emerald-50 p-6">
                <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-600" />
                <h2 className="font-medium">Reservation confirmed</h2>
                <p className="mt-1 text-sm text-[#54606B]">
                  {order.paymentMethod === "ON_ARRIVAL"
                    ? "This is a legacy pay-on-arrival reservation. Payment remains due before admission."
                    : "Your payment has been confirmed."}
                </p>
                <p className="mt-4 text-xs text-[#7D8A95]">
                  Tickets issued: {order.tickets.length}
                </p>
                {order.tickets.length > 0 && (
                  <Link
                    href={`/tickets/${order.orderNumber}?token=${encodeURIComponent(accessToken)}`}
                    className="mt-5 inline-flex rounded-sm bg-[#0E1721] px-6 py-3 text-xs uppercase tracking-[.18em] text-white transition-colors hover:bg-[#2271B1]"
                  >
                    View digital tickets →
                  </Link>
                )}
              </div>
            ) : (
              <>
                {expired && (
                  <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm">
                    This reservation hold has expired. Please create a new reservation.
                  </div>
                )}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed border border-[#C2CBD2] p-5 text-left opacity-50"
                  >
                    <CreditCard className="mb-3 h-5 w-5 text-[#2271B1]" />
                    <div className="font-medium">Card</div>
                    <p className="mt-2 text-xs leading-relaxed text-[#7D8A95]">
                      Hosted OnePay checkout will be connected later.
                    </p>
                    <div className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                      Not available yet
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={chooseSlip}
                    disabled={expired || !bankTransfer}
                    className={`border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      method === "BANK_SLIP"
                        ? "border-[#2271B1] bg-[#2271B1]/5"
                        : "border-[#C2CBD2] hover:border-[#7D8A95]"
                    }`}
                  >
                    <Upload className="mb-3 h-5 w-5 text-[#2271B1]" />
                    <div className="font-medium">Slip upload</div>
                    <p className="mt-2 text-xs leading-relaxed text-[#7D8A95]">
                      Transfer using the displayed bank details and upload proof.
                    </p>
                  </button>
                </div>

                {method === "CARD" && (
                  <div className="mt-6 border border-[#C2CBD2] p-5 sm:p-6">
                    <h2 className="font-medium">Card payment</h2>
                    <p className="mt-2 text-sm text-[#7D8A95]">
                      Card checkout is not connected yet. Select Slip Upload to continue.
                    </p>
                  </div>
                )}

                {method === "BANK_SLIP" && (
                  <div className="mt-6 border border-[#C2CBD2] p-5 sm:p-6">
                    <h2 className="font-medium">Bank transfer slip</h2>

                    {bankTransfer ? (
                      <div className="mt-4 border border-[#C2CBD2]/70 bg-[#F8FAFB] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2271B1]">
                            Transfer details
                          </div>
                          {bankTransfer.isMock && (
                            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-800">
                              Demo only
                            </span>
                          )}
                        </div>

                        {bankTransfer.isMock && (
                          <div className="mt-3 border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                            These are temporary testing details. Do not make a real transfer to this account.
                          </div>
                        )}

                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="text-[10px] uppercase tracking-[0.12em] text-[#7D8A95]">Bank</dt>
                            <dd className="mt-1 font-medium">{bankTransfer.bankName}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-[0.12em] text-[#7D8A95]">Account name</dt>
                            <dd className="mt-1 font-medium">{bankTransfer.accountName}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-[0.12em] text-[#7D8A95]">Account number</dt>
                            <dd className="mt-1 font-mono font-semibold">{bankTransfer.accountNumber}</dd>
                          </div>
                          {bankTransfer.branch && (
                            <div>
                              <dt className="text-[10px] uppercase tracking-[0.12em] text-[#7D8A95]">Branch</dt>
                              <dd className="mt-1 font-medium">{bankTransfer.branch}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    ) : (
                      <div className="mt-4 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Bank transfer details are not configured yet.
                      </div>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-[#7D8A95]">
                      Upload a JPG, PNG, WebP or PDF. Images are converted to WebP
                      where supported and PDFs are optimized before upload. Final
                      uploads are limited to {fileSize(MAX_FINAL_SLIP_BYTES)}.
                    </p>

                    {order.slipStatus === "PENDING" ? (
                      <div className="mt-5 flex gap-2 text-sm text-amber-700">
                        <Clock3 className="h-4 w-4 shrink-0" />
                        Slip submitted — awaiting staff verification.
                      </div>
                    ) : (
                      <form onSubmit={submitSlip} className="mt-5 space-y-4">
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(event) => {
                            void prepareSlip(event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => inputRef.current?.click()}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              inputRef.current?.click();
                            }
                          }}
                          onDragEnter={(event) => {
                            event.preventDefault();
                            setDragging(true);
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                          }}
                          onDragLeave={(event) => {
                            event.preventDefault();
                            if (
                              event.currentTarget.contains(
                                event.relatedTarget as Node | null,
                              )
                            ) {
                              return;
                            }
                            setDragging(false);
                          }}
                          onDrop={onDrop}
                          className={`flex min-h-44 cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition ${
                            dragging
                              ? "border-[#2271B1] bg-[#2271B1]/5"
                              : "border-[#AAB6C0] bg-[#F8FAFB] hover:border-[#2271B1] hover:bg-white"
                          }`}
                        >
                          {optimizing ? (
                            <>
                              <UploadCloud className="h-7 w-7 animate-pulse text-[#2271B1]" />
                              <div className="mt-3 text-sm font-medium">Optimizing slip…</div>
                              <div className="mt-1 text-xs text-[#7D8A95]">Preparing the file before upload.</div>
                            </>
                          ) : slip ? (
                            <>
                              {slip.type === "application/pdf" ? (
                                <FileText className="h-7 w-7 text-[#2271B1]" />
                              ) : (
                                <ImageIcon className="h-7 w-7 text-[#2271B1]" />
                              )}
                              <div className="mt-3 max-w-full truncate text-sm font-medium">{slip.name}</div>
                              <div className="mt-1 text-xs text-[#7D8A95]">Ready • {fileSize(slip.size)}</div>
                              <div className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#2271B1]">Click to replace</div>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-7 w-7 text-[#2271B1]" />
                              <div className="mt-3 text-sm font-medium">Click to upload or drag & drop</div>
                              <div className="mt-1 text-xs text-[#7D8A95]">
                                JPG, PNG, WebP or PDF • source up to {fileSize(MAX_SOURCE_SLIP_BYTES)}
                              </div>
                            </>
                          )}
                        </div>

                        {slip && (
                          <button
                            type="button"
                            onClick={() => setSlip(null)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#7D8A95] hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove selected slip
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={pending || expired || optimizing || !slip || !bankTransfer}
                          className="bg-[#0E1721] px-6 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#2271B1] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pending ? "Uploading…" : "Upload payment slip"}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {message && (
                  <p className="mt-4 text-sm text-red-600">{message}</p>
                )}
              </>
            )}
          </section>

          <aside className="h-fit border border-[#C2CBD2] p-6">
            <div className="flex items-center gap-2 text-xs text-[#7D8A95]">
              <ShieldCheck className="h-4 w-4 text-[#2271B1]" />
              Protected reservation
            </div>
            <h2 className="mt-5 font-gemola text-2xl">{order.eventName}</h2>
            <div className="mt-6 space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between gap-4 text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="shrink-0">
                    {order.currency} {item.totalPrice.toLocaleString("en-LK")}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between border-t pt-5 font-medium">
              <span>Total</span>
              <span>{order.currency} {order.total.toLocaleString("en-LK")}</span>
            </div>
            {order.expiresAt && order.status === "PENDING" && (
              <p className="mt-4 text-xs text-[#7D8A95]">
                Hold until {new Date(order.expiresAt).toLocaleString("en-LK")}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
