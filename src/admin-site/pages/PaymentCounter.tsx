"use client";

import { BrowserQRCodeReader } from "@zxing/browser";
import {
  BadgeCheck,
  Camera,
  CameraOff,
  Copy,
  CreditCard,
  Link2,
  QrCode,
  Search,
  Smartphone,
  TicketCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  collectOnArrivalPayment,
  findPaymentCounterOrder,
  type PaymentCounterOrder,
} from "@/app/admin/actions/payment-counter";
import { createClient } from "@/lib/supabase/client";

type ScannerControls = {
  stop: () => void;
};

type RemoteScanPayload = {
  value: string;
  requestId: string;
  sentAt: number;
};

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-LK")}`;
}

function isRemoteScanPayload(value: unknown): value is RemoteScanPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.value === "string" &&
    typeof payload.requestId === "string" &&
    typeof payload.sentAt === "number"
  );
}

function createRemoteSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function PaymentCounter() {
  const [identifier, setIdentifier] = useState("");
  const [order, setOrder] = useState<PaymentCounterOrder | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [remoteSessionId, setRemoteSessionId] = useState("");
  const [remotePairUrl, setRemotePairUrl] = useState("");
  const [remotePairQr, setRemotePairQr] = useState("");
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraControlsRef = useRef<ScannerControls | null>(null);
  const lookupBusyRef = useRef(false);
  const remoteChannelRef = useRef<RealtimeChannel | null>(null);
  const remoteLastSeenRef = useRef(0);
  const seenRemoteRequestsRef = useRef(new Set<string>());

  const lookupIdentifier = useCallback(
    (value: string, source: "manual" | "camera" | "remote") => {
      const clean = value.trim();
      if (!clean || lookupBusyRef.current) return;

      lookupBusyRef.current = true;
      setError("");
      setMessage("");

      startTransition(async () => {
        try {
          const result = await findPaymentCounterOrder(clean);
          if (!result.ok || !result.order) {
            setOrder(null);
            setError(result.message);
            return;
          }

          setOrder(result.order);
          setIdentifier(
            result.order.ticketNumber || result.order.orderNumber || clean,
          );
          setMessage(
            source === "remote"
              ? `Remote scan received. ${result.message}`
              : source === "camera"
                ? `QR scanned. ${result.message}`
                : result.message,
          );
        } finally {
          lookupBusyRef.current = false;
        }
      });
    },
    [],
  );

  const lookup = () => {
    lookupIdentifier(identifier, "manual");
  };

  const markPaid = () => {
    if (!order || pending) return;

    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await collectOnArrivalPayment(order.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      const refreshed = await findPaymentCounterOrder(order.orderNumber);
      if (refreshed.ok && refreshed.order) {
        setOrder(refreshed.order);
      }
    });
  };

  useEffect(() => {
    if (!cameraOpen) return;

    let disposed = false;
    const reader = new BrowserQRCodeReader();

    setCameraReady(false);
    setCameraError("");

    const start = async () => {
      if (!videoRef.current) return;

      try {
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 1280 },
            },
          },
          videoRef.current,
          (decoded) => {
            if (!decoded || disposed) return;
            controls?.stop();
            setCameraOpen(false);
            lookupIdentifier(decoded.getText(), "camera");
          },
        );

        if (disposed) {
          controls.stop();
          return;
        }

        cameraControlsRef.current = controls;
        setCameraReady(true);
      } catch (cameraFailure) {
        console.error("Payment counter camera failed:", cameraFailure);
        if (!disposed) {
          setCameraError(
            "Camera unavailable. Allow permission and use HTTPS or localhost.",
          );
        }
      }
    };

    void start();

    return () => {
      disposed = true;
      cameraControlsRef.current?.stop();
      cameraControlsRef.current = null;
      setCameraReady(false);
    };
  }, [cameraOpen, lookupIdentifier]);

  useEffect(() => {
    const sessionId = createRemoteSessionId();
    setRemoteSessionId(sessionId);
    setRemotePairUrl(
      `${window.location.origin}/remote/payment-scanner/${encodeURIComponent(
        sessionId,
      )}`,
    );
  }, []);

  useEffect(() => {
    if (!remotePairUrl) return;

    let cancelled = false;
    QRCode.toDataURL(remotePairUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0E1721", light: "#FFFFFF" },
    })
      .then((dataUrl) => {
        if (!cancelled) setRemotePairQr(dataUrl);
      })
      .catch((qrError) => {
        console.error("Remote pairing QR failed:", qrError);
      });

    return () => {
      cancelled = true;
    };
  }, [remotePairUrl]);

  useEffect(() => {
    if (!remoteSessionId) return;

    const supabase = createClient();
    const channel = supabase.channel(`sr-payment-counter:${remoteSessionId}`, {
      config: { broadcast: { ack: true } },
    });
    remoteChannelRef.current = channel;

    channel
      .on(
        "broadcast",
        { event: "remote_ready" },
        () => {
          remoteLastSeenRef.current = Date.now();
          setRemoteConnected(true);
        },
      )
      .on(
        "broadcast",
        { event: "remote_scan" },
        (message: { payload?: unknown }) => {
          if (!isRemoteScanPayload(message.payload)) return;

          const payload = message.payload;
          remoteLastSeenRef.current = Date.now();
          setRemoteConnected(true);

          if (seenRemoteRequestsRef.current.has(payload.requestId)) return;
          seenRemoteRequestsRef.current.add(payload.requestId);
          if (seenRemoteRequestsRef.current.size > 100) {
            const first = seenRemoteRequestsRef.current.values().next().value;
            if (typeof first === "string") {
              seenRemoteRequestsRef.current.delete(first);
            }
          }

          lookupIdentifier(payload.value, "remote");
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.send({
            type: "broadcast",
            event: "desktop_ready",
            payload: { readyAt: Date.now() },
          });
        }
      });

    const connectionTimer = window.setInterval(() => {
      const fresh = Date.now() - remoteLastSeenRef.current < 22000;
      setRemoteConnected(fresh);
      if (fresh) {
        void channel.send({
          type: "broadcast",
          event: "desktop_ready",
          payload: { readyAt: Date.now() },
        });
      }
    }, 8000);

    return () => {
      window.clearInterval(connectionTimer);
      remoteChannelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [lookupIdentifier, remoteSessionId]);

  const resetRemoteSession = () => {
    setRemoteConnected(false);
    setRemotePairQr("");
    remoteLastSeenRef.current = 0;
    seenRemoteRequestsRef.current.clear();
    const sessionId = createRemoteSessionId();
    setRemoteSessionId(sessionId);
    setRemotePairUrl(
      `${window.location.origin}/remote/payment-scanner/${encodeURIComponent(
        sessionId,
      )}`,
    );
  };

  const copyRemoteLink = async () => {
    if (!remotePairUrl) return;
    try {
      await navigator.clipboard.writeText(remotePairUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy the remote scanner link.");
    }
  };

  const canCollect =
    order?.paymentMethod === "ON_ARRIVAL" &&
    order?.status === "CONFIRMED" &&
    order?.paymentStatus === "PENDING";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#2271B1]">
          Box office workflow
        </div>
        <h1 className="mt-2 font-gemola text-4xl text-[#0E1721]">
          Payment counter
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7D8A95]">
          Find a pay-on-arrival reservation by typing, scanning on this device,
          or pairing a phone as a remote QR scanner. Payment collection never
          admits the ticket; the guest still goes to the gate after payment.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-[#C2CBD2]/60 bg-white p-5 shadow-sm sm:p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              lookup();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A95]" />
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Order number, ticket number or QR token"
                className="h-12 w-full rounded-xl border border-[#C2CBD2] pl-11 pr-4 font-mono text-sm outline-none focus:border-[#2271B1]"
              />
            </div>
            <button
              type="submit"
              disabled={pending || !identifier.trim()}
              className="h-12 rounded-xl bg-[#0E1721] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2271B1] disabled:opacity-40"
            >
              {pending ? "Checking…" : "Find reservation"}
            </button>
          </form>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#C2CBD2] bg-white px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1]"
            >
              <Camera className="h-4 w-4" />
              Scan here
            </button>
            <a
              href={remotePairUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#C2CBD2] bg-white px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1]"
            >
              <Smartphone className="h-4 w-4" />
              Phone scanner
            </a>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#C2CBD2]/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D8A95]">
                Remote scanner
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0E1721]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    remoteConnected ? "bg-emerald-500" : "bg-[#C2CBD2]"
                  }`}
                />
                {remoteConnected ? "Phone connected" : "Waiting for phone"}
              </div>
            </div>
            <button
              type="button"
              onClick={resetRemoteSession}
              className="rounded-lg p-2 text-[#7D8A95] transition hover:bg-[#F3F5F7] hover:text-[#2271B1]"
              aria-label="Create new remote scanner session"
              title="Create new pairing session"
            >
              <Link2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-[#C2CBD2] bg-[#F8FAFB] p-3">
            {remotePairQr ? (
              <img
                src={remotePairQr}
                alt="Pair phone with payment counter"
                className="h-44 w-44 rounded-lg bg-white p-1"
              />
            ) : (
              <QrCode className="h-10 w-10 text-[#C2CBD2]" />
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[#7D8A95]">
            Scan this pairing QR with the phone camera, open the link, then use
            the phone as the counter scanner. The pairing session contains no
            customer or payment data.
          </p>

          <button
            type="button"
            onClick={copyRemoteLink}
            disabled={!remotePairUrl}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#C2CBD2] text-[10px] font-bold uppercase tracking-[0.12em] text-[#31465A] transition hover:border-[#2271B1] hover:text-[#2271B1] disabled:opacity-40"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy pairing link"}
          </button>
        </aside>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && !error && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {order && (
        <div className="overflow-hidden rounded-2xl border border-[#C2CBD2]/60 bg-white shadow-sm">
          <div className="border-b border-[#C2CBD2]/50 bg-[#F8FAFB] px-5 py-4 sm:px-6">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7D8A95]">
              Reservation
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-[#2271B1]">
              {order.orderNumber}
            </div>
            {order.ticketNumber && (
              <div className="mt-1 font-mono text-[10px] text-[#7D8A95]">
                Scanned ticket {order.ticketNumber}
              </div>
            )}
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Guest
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.customerName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Show
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.eventName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Payment method
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.paymentMethod?.replaceAll("_", " ") ?? "Not selected"}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Amount
              </div>
              <div className="mt-1 text-xl font-bold text-[#0E1721]">
                {money(order.currency, order.total)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Reservation status
              </div>
              <div className="mt-1 font-medium text-[#0E1721]">
                {order.status}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#7D8A95]">
                Payment status
              </div>
              <div
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus}
              </div>
            </div>
          </div>

          <div className="border-t border-[#C2CBD2]/50 p-5 sm:p-6">
            {canCollect ? (
              <button
                type="button"
                onClick={markPaid}
                disabled={pending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0E1721] px-5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2271B1] disabled:opacity-40"
              >
                <CreditCard className="h-5 w-5" />
                {pending ? "Recording…" : "Mark payment as received"}
              </button>
            ) : order.paymentStatus === "PAID" ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <TicketCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Payment is confirmed. Send the guest to the gate; the gate
                  scan will admit and mark the ticket as used.
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                This reservation cannot be collected from the on-arrival
                payment counter. Check its payment method and reservation
                status in Orders.
              </div>
            )}
          </div>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#0E1721]/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#C2CBD2]/60 px-5 py-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2271B1]">
                  Built-in scanner
                </div>
                <div className="mt-1 text-sm font-medium text-[#0E1721]">
                  Point the camera at the ticket QR
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCameraOpen(false)}
                className="rounded-full p-2 text-[#7D8A95] hover:bg-[#F3F5F7]"
                aria-label="Close camera scanner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-square bg-black">
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-[13%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.24)]" />
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
                  Starting camera…
                </div>
              )}
            </div>

            <div className="p-4">
              {cameraError ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <CameraOff className="mt-0.5 h-4 w-4 shrink-0" />
                  {cameraError}
                </div>
              ) : (
                <p className="text-center text-xs text-[#7D8A95]">
                  The scanner closes automatically after a QR is read.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
