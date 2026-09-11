"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  HandCoins,
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
  confirmOnArrival,
  selectPaymentMethod,
  uploadPaymentSlip,
} from "@/app/actions/payment";
import {
  MAX_FINAL_SLIP_BYTES,
  MAX_SOURCE_SLIP_BYTES,
  preparePaymentSlip,
} from "@/lib/payment/compressSlip";
import type {
  GuestPaymentOrder,
  PaymentMethod,
} from "@/lib/payment/order";

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PaymentPageClient({
  order,
  accessToken,
}: {
  order: GuestPaymentOrder;
  accessToken: string;
}) {
  const [method, setMethod] = useState<PaymentMethod>(
    order.paymentMethod ?? "CARD",
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

  const choose = (nextMethod: PaymentMethod) => {
    setMethod(nextMethod);
    setMessage("");

    startTransition(async () => {
      const result = await selectPaymentMethod(
        order.orderNumber,
        accessToken,
        nextMethod,
      );
      if (!result.ok) {
        setMessage(result.message || "Unable to select payment method.");
      }
    });
  };

  const onArrival = () =>
    startTransition(async () => {
      const result = await confirmOnArrival(
        order.orderNumber,
        accessToken,
      );
      if (result.ok) location.reload();
      else setMessage(result.message || "Unable to continue.");
    });

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
                    ? "Pay at the entrance before admission."
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
                    This reservation hold has expired. Please create a new
                    reservation.
                  </div>
                )}

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      [
                        "CARD",
                        CreditCard,
                        "Card",
                        "Pay through a secure hosted card gateway.",
                      ],
                      [
                        "ON_ARRIVAL",
                        HandCoins,
                        "On arrival",
                        "Reserve now and pay at the entrance.",
                      ],
                      [
                        "BANK_SLIP",
                        Upload,
                        "Slip upload",
                        "Transfer to our bank and upload proof.",
                      ],
                    ] as const
                  ).map(([id, Icon, title, description]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => choose(id)}
                      disabled={expired}
                      className={`border p-5 text-left transition ${
                        method === id
                          ? "border-[#2271B1] bg-[#2271B1]/5"
                          : "border-[#C2CBD2] hover:border-[#7D8A95]"
                      }`}
                    >
                      <Icon className="mb-3 h-5 w-5 text-[#2271B1]" />
                      <div className="font-medium">{title}</div>
                      <p className="mt-2 text-xs leading-relaxed text-[#7D8A95]">
                        {description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 border border-[#C2CBD2] p-5 sm:p-6">
                  {method === "CARD" && (
                    <>
                      <h2 className="font-medium">Card payment</h2>
                      <p className="mt-2 text-sm text-[#7D8A95]">
                        Card details will be entered on the payment provider's
                        hosted page — never on this website.
                      </p>
                      <button
                        disabled
                        className="mt-5 bg-[#0E1721]/50 px-6 py-3 text-xs uppercase tracking-[.18em] text-white"
                      >
                        Card gateway connection pending
                      </button>
                    </>
                  )}

                  {method === "ON_ARRIVAL" && (
                    <>
                      <h2 className="font-medium">Pay on arrival</h2>
                      <p className="mt-2 text-sm text-[#7D8A95]">
                        Your seats become confirmed now. Payment remains due at
                        the entrance.
                      </p>
                      <button
                        disabled={pending || expired}
                        onClick={onArrival}
                        className="mt-5 bg-[#0E1721] px-6 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#2271B1]"
                      >
                        Confirm pay on arrival
                      </button>
                    </>
                  )}

                  {method === "BANK_SLIP" && (
                    <>
                      <h2 className="font-medium">Bank transfer slip</h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#7D8A95]">
                        Drop a JPG, PNG, WebP or PDF here. Images are converted
                        to WebP and compressed; PDFs are optimized before upload.
                        Final uploads are limited to{" "}
                        {fileSize(MAX_FINAL_SLIP_BYTES)}.
                      </p>

                      {order.slipStatus === "PENDING" ? (
                        <div className="mt-5 flex gap-2 text-sm text-amber-700">
                          <Clock3 className="h-4 w-4 shrink-0" />
                          Slip submitted — awaiting staff verification.
                        </div>
                      ) : (
                        <form
                          onSubmit={submitSlip}
                          className="mt-5 space-y-4"
                        >
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
                            className={`flex min-h-44 flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition ${
                              dragging
                                ? "border-[#2271B1] bg-[#2271B1]/5"
                                : "border-[#AAB6C0] bg-[#F8FAFB] hover:border-[#2271B1] hover:bg-white"
                            }`}
                          >
                            {optimizing ? (
                              <>
                                <UploadCloud className="h-7 w-7 animate-pulse text-[#2271B1]" />
                                <div className="mt-3 text-sm font-medium">
                                  Optimizing slip…
                                </div>
                                <div className="mt-1 text-xs text-[#7D8A95]">
                                  Converting/compressing before upload.
                                </div>
                              </>
                            ) : slip ? (
                              <>
                                {slip.type === "application/pdf" ? (
                                  <FileText className="h-7 w-7 text-[#2271B1]" />
                                ) : (
                                  <ImageIcon className="h-7 w-7 text-[#2271B1]" />
                                )}
                                <div className="mt-3 max-w-full truncate text-sm font-medium">
                                  {slip.name}
                                </div>
                                <div className="mt-1 text-xs text-[#7D8A95]">
                                  Ready • {fileSize(slip.size)}
                                </div>
                                <div className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#2271B1]">
                                  Click to replace
                                </div>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-7 w-7 text-[#2271B1]" />
                                <div className="mt-3 text-sm font-medium">
                                  Click to upload or drag & drop
                                </div>
                                <div className="mt-1 text-xs text-[#7D8A95]">
                                  JPG, PNG, WebP or PDF • source up to{" "}
                                  {fileSize(MAX_SOURCE_SLIP_BYTES)}
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
                            disabled={
                              pending ||
                              expired ||
                              optimizing ||
                              !slip
                            }
                            className="bg-[#0E1721] px-6 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#2271B1] disabled:opacity-50"
                          >
                            {pending ? "Uploading…" : "Upload payment slip"}
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>

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
                <div
                  key={index}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0">
                    {order.currency}{" "}
                    {item.totalPrice.toLocaleString("en-LK")}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between border-t pt-5 font-medium">
              <span>Total</span>
              <span>
                {order.currency} {order.total.toLocaleString("en-LK")}
              </span>
            </div>
            {order.expiresAt && order.status === "PENDING" && (
              <p className="mt-4 text-xs text-[#7D8A95]">
                Hold until{" "}
                {new Date(order.expiresAt).toLocaleString("en-LK")}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
