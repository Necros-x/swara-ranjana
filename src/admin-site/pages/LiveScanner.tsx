"use client";

import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Flashlight,
  RefreshCcw,
  Search,
  ShieldAlert,
  SwitchCamera,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  redeemScannedTicket,
  type ScannerActionResult,
} from "@/app/admin/actions/scanner";

type FacingMode = "environment" | "user";

type ScannerControls = {
  stop: () => void;
  switchTorch?: (on: boolean) => Promise<void>;
};

interface ScannerEvent {
  id: string;
  name: string;
}

function formatUsedAt(value?: string | null) {
  if (!value) return "Previous admission time unavailable";
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

function resultAppearance(result: ScannerActionResult["result"]) {
  if (result === "ADMITTED") {
    return {
      background: "bg-emerald-600",
      foreground: "text-white",
      Icon: CheckCircle2,
      title: "Admit Guest",
      description: "Ticket accepted and marked as used.",
    };
  }

  if (result === "PAYMENT_DUE") {
    return {
      background: "bg-amber-400",
      foreground: "text-[#18130A]",
      Icon: WalletCards,
      title: "Payment Due",
      description: "Send the guest to the payment counter before admission.",
    };
  }

  if (result === "DUPLICATE") {
    return {
      background: "bg-yellow-400",
      foreground: "text-[#18130A]",
      Icon: AlertTriangle,
      title: "Already Used",
      description: "This ticket has already entered the event.",
    };
  }

  return {
    background: "bg-red-600",
    foreground: "text-white",
    Icon: XCircle,
    title:
      result === "REVOKED"
        ? "Revoked Ticket"
        : result === "REFUNDED"
          ? "Refunded Ticket"
          : result === "WRONG_EVENT"
            ? "Wrong Event"
            : result === "ERROR"
              ? "Scanner Error"
              : "Invalid Ticket",
    description:
      result === "WRONG_EVENT"
        ? "This ticket belongs to another event."
        : result === "REVOKED"
          ? "This ticket was revoked and cannot be admitted."
          : result === "REFUNDED"
            ? "This ticket was refunded and cannot be admitted."
            : result === "ERROR"
              ? "Validation could not be completed."
              : "This QR code is not recognized.",
  };
}

export default function LiveScanner({
  event,
}: {
  event: ScannerEvent;
  staffRole?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const processingRef = useRef(false);

  const [result, setResult] = useState<ScannerActionResult | null>(null);
  const [facingMode, setFacingMode] =
    useState<FacingMode>("environment");
  const [restartKey, setRestartKey] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [gate, setGate] = useState("Main Gate");

  useEffect(() => {
    const saved = window.localStorage.getItem("sr-scanner-gate");
    if (saved) setGate(saved);
  }, []);

  const updateGate = (value: string) => {
    setGate(value);
    window.localStorage.setItem("sr-scanner-gate", value);
  };

  const scanIdentifier = useCallback(
    async (identifier: string, source: "camera" | "manual") => {
      const clean = identifier.trim();
      if (!clean || processingRef.current) return;

      processingRef.current = true;
      setCameraError("");

      const response = await redeemScannedTicket({
        identifier: clean,
        eventId: event.id,
        gate,
        device: {
          source,
          userAgent: navigator.userAgent.slice(0, 180),
        },
      });

      if ("vibrate" in navigator) {
        navigator.vibrate?.(
          response.result === "ADMITTED" ? 120 : [90, 70, 90],
        );
      }

      setResult(response);
      setManualOpen(false);
      setManualValue("");
    },
    [event.id, gate],
  );

  useEffect(() => {
    if (result || manualOpen) return;

    let disposed = false;
    const reader = new BrowserQRCodeReader();

    setCameraReady(false);
    setCameraError("");
    setTorchAvailable(false);
    setTorchOn(false);

    const start = async () => {
      if (!videoRef.current) return;

      try {
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 1280 },
            },
          },
          videoRef.current,
          (decoded) => {
            if (decoded) void scanIdentifier(decoded.getText(), "camera");
          },
        );

        if (disposed) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setTorchAvailable(
          typeof (controls as ScannerControls).switchTorch === "function",
        );
        setCameraReady(true);
      } catch (error) {
        console.error("Camera scanner failed:", error);
        if (!disposed) {
          setCameraError(
            "Camera unavailable. Allow camera permission and use HTTPS or localhost, or use manual lookup.",
          );
        }
      }
    };

    void start();

    return () => {
      disposed = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      setCameraReady(false);
      setTorchAvailable(false);
      setTorchOn(false);
    };
  }, [facingMode, manualOpen, restartKey, result, scanIdentifier]);

  const reset = () => {
    processingRef.current = false;
    setResult(null);
    setCameraError("");
  };

  const toggleTorch = async () => {
    const controls = controlsRef.current;
    if (!controls?.switchTorch) return;

    try {
      const next = !torchOn;
      await controls.switchTorch(next);
      setTorchOn(next);
    } catch {
      setCameraError("Torch control is not supported by this camera.");
    }
  };

  const submitManual = (eventSubmit: React.FormEvent) => {
    eventSubmit.preventDefault();
    void scanIdentifier(manualValue, "manual");
  };

  if (result) {
    const appearance = resultAppearance(result.result);
    const Icon = appearance.Icon;

    return (
      <div
        className={`mx-auto flex min-h-[calc(100vh-10rem)] max-w-xl flex-col rounded-2xl p-6 shadow-xl sm:p-8 ${appearance.background} ${appearance.foreground}`}
      >
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Icon className="mb-5 h-24 w-24 sm:h-28 sm:w-28" />
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">
            {event.name}
          </div>
          <h1 className="mt-3 text-3xl font-bold uppercase tracking-wide sm:text-4xl">
            {appearance.title}
          </h1>
          <p className="mt-2 max-w-sm text-sm opacity-80">
            {result.message || appearance.description}
          </p>

          {(result.ticketNumber || result.customerName) && (
            <div className="mt-7 w-full rounded-2xl border border-current/15 bg-black/10 p-5 backdrop-blur-sm">
              <div className="text-xl font-semibold">
                {result.customerName || "Concert guest"}
              </div>
              <div className="mt-1 font-mono text-sm opacity-75">
                {result.ticketNumber || "Ticket"}
              </div>
              {result.ticketType && (
                <div className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#0E1721]">
                  {result.ticketType}
                </div>
              )}

              {result.result === "DUPLICATE" && (
                <div className="mt-5 rounded-lg bg-white/35 p-4 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    First used
                  </div>
                  <div className="mt-1 font-medium">
                    {formatUsedAt(result.firstUsedAt)}
                  </div>
                </div>
              )}

              {result.result === "PAYMENT_DUE" && (
                <div className="mt-5 rounded-lg bg-black/10 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    Amount due
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {result.currency || "LKR"}{" "}
                    {(result.amountDue ?? 0).toLocaleString("en-LK")}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.result === "ADMITTED" && (
            <div className="mt-7 rounded-full border border-white/20 bg-black/15 px-7 py-3 text-xl font-bold">
              ADMIT CUSTOMER
            </div>
          )}

          {result.result === "PAYMENT_DUE" && (
            <div className="mt-6 flex max-w-sm gap-3 rounded-xl border border-black/10 bg-white/35 p-4 text-left text-sm">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Payment is handled at the payment counter. Do not admit this
                guest until the counter marks the reservation as paid; then
                scan the ticket again at the gate.
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={reset}
            className="h-14 rounded-xl bg-white px-5 text-sm font-bold uppercase tracking-wider text-[#0E1721] transition hover:bg-white/90"
          >
            {result.result === "ADMITTED" ? "Scan next ticket" : "Try another ticket"}
          </button>

          {result.result !== "ADMITTED" && (
            <button
              type="button"
              onClick={() => {
                reset();
                setManualOpen(true);
              }}
              className="h-12 rounded-xl border border-current/20 px-5 text-sm font-semibold"
            >
              Manual ticket lookup
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-2xl bg-[#0E1721] text-white shadow-xl">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#C2CBD2]">
                Live entrance validation
              </div>
              <h1 className="mt-1 font-gemola text-3xl">{event.name}</h1>
            </div>

            <label className="min-w-[155px]">
              <span className="mb-1 block text-[9px] uppercase tracking-[0.2em] text-[#C2CBD2]">
                Gate
              </span>
              <input
                value={gate}
                onChange={(eventInput) => updateGate(eventInput.target.value)}
                className="h-10 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-[#2271B1]"
                placeholder="Main Gate"
              />
            </label>
          </div>

          <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-2xl bg-[#111D28]">
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />

            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#C2CBD2]">
                Starting camera…
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <CameraOff className="h-10 w-10 text-red-300" />
                <p className="mt-4 text-sm leading-relaxed text-[#C2CBD2]">
                  {cameraError}
                </p>
              </div>
            )}

            <div className="pointer-events-none absolute inset-[11%] rounded-2xl border border-white/35">
              <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-[#2271B1]" />
              <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-[#2271B1]" />
              <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-[#2271B1]" />
              <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-[#2271B1]" />
            </div>

            {cameraReady && (
              <div className="pointer-events-none absolute left-[11%] right-[11%] top-1/2 h-px bg-[#2271B1] shadow-[0_0_12px_3px_rgba(34,113,177,.65)]" />
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleTorch}
              disabled={!torchAvailable}
              title={torchAvailable ? "Toggle torch" : "Torch unavailable"}
              className={`rounded-full p-3.5 transition ${
                torchOn
                  ? "bg-[#2271B1] text-white"
                  : "bg-white/10 text-white hover:bg-white/15"
              } disabled:opacity-30`}
            >
              <Flashlight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setFacingMode((mode) =>
                  mode === "environment" ? "user" : "environment",
                )
              }
              title="Switch camera"
              className="rounded-full bg-white/10 p-3.5 text-white transition hover:bg-white/15"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                controlsRef.current?.stop();
                controlsRef.current = null;
                setRestartKey((value) => value + 1);
              }}
              title="Restart camera"
              className="rounded-full bg-white/10 p-3.5 text-white transition hover:bg-white/15"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-[#C2CBD2]">
            Align the ticket QR inside the frame. A successful read validates
            automatically.
          </p>

          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-sm font-medium transition hover:bg-white/10"
          >
            <Search className="h-4 w-4" />
            Manual ticket number
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#C2CBD2]/50 bg-white p-4 text-xs leading-relaxed text-[#7D8A95]">
        <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#2271B1]" />
        Camera scanning requires HTTPS on phones. Local development also works
        on localhost.
      </div>

      {manualOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E1721]/70 p-4 backdrop-blur-sm"
          onClick={() => setManualOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 text-[#0E1721] shadow-2xl"
            onClick={(eventClick) => eventClick.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#2271B1]">
                  Manual validation
                </div>
                <h2 className="mt-1 font-gemola text-2xl">
                  Enter ticket number
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="rounded-full p-2 text-[#7D8A95] hover:bg-[#F1F4F6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitManual} className="mt-6">
              <input
                autoFocus
                value={manualValue}
                onChange={(eventInput) =>
                  setManualValue(eventInput.target.value.toUpperCase())
                }
                placeholder="SR26-T0001001"
                className="h-12 w-full rounded-xl border border-[#C2CBD2] px-4 font-mono text-sm outline-none focus:border-[#2271B1]"
              />
              <button
                type="submit"
                disabled={!manualValue.trim()}
                className="mt-3 h-12 w-full rounded-xl bg-[#0E1721] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#2271B1] disabled:opacity-40"
              >
                Validate ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
