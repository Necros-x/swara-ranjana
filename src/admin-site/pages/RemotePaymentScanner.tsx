"use client";

import { BrowserQRCodeReader } from "@zxing/browser";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  RefreshCcw,
  Smartphone,
  SwitchCamera,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FacingMode = "environment" | "user";

type ScannerControls = {
  stop: () => void;
};

export default function RemotePaymentScanner({
  sessionId,
}: {
  sessionId: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastValueRef = useRef("");
  const lastScanAtRef = useRef(0);

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [restartKey, setRestartKey] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [channelReady, setChannelReady] = useState(false);
  const [desktopConnected, setDesktopConnected] = useState(false);
  const [lastScan, setLastScan] = useState("");
  const [lastSentAt, setLastSentAt] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`sr-payment-counter:${sessionId}`, {
      config: { broadcast: { ack: true } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "desktop_ready" }, () => {
        setDesktopConnected(true);
      })
      .subscribe((status) => {
        const subscribed = status === "SUBSCRIBED";
        setChannelReady(subscribed);
        if (subscribed) {
          void channel.send({
            type: "broadcast",
            event: "remote_ready",
            payload: { readyAt: Date.now() },
          });
        }
      });

    const heartbeat = window.setInterval(() => {
      void channel.send({
        type: "broadcast",
        event: "remote_ready",
        payload: { readyAt: Date.now() },
      });
    }, 8000);

    return () => {
      window.clearInterval(heartbeat);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
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
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 1280 },
            },
          },
          videoRef.current,
          (decoded) => {
            if (!decoded || disposed) return;

            const value = decoded.getText().trim();
            if (!value) return;

            const now = Date.now();
            if (
              value === lastValueRef.current &&
              now - lastScanAtRef.current < 1800
            ) {
              return;
            }

            lastValueRef.current = value;
            lastScanAtRef.current = now;

            const channel = channelRef.current;
            if (!channel) return;

            void channel.send({
              type: "broadcast",
              event: "remote_scan",
              payload: {
                value,
                requestId:
                  typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${now}-${Math.random().toString(36).slice(2)}`,
                sentAt: now,
              },
            });

            setLastScan(value);
            setLastSentAt(now);
            navigator.vibrate?.(90);
          },
        );

        if (disposed) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setCameraReady(true);
      } catch (error) {
        console.error("Remote payment scanner camera failed:", error);
        if (!disposed) {
          setCameraError(
            "Camera unavailable. Allow camera access and open this page over HTTPS.",
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
    };
  }, [facingMode, restartKey]);

  const switchCamera = () => {
    setFacingMode((current) =>
      current === "environment" ? "user" : "environment",
    );
    setRestartKey((value) => value + 1);
  };

  return (
    <main className="min-h-[100dvh] bg-[#0E1721] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 py-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#62B6F3]">
              Swara Ranjana • Payment Counter
            </div>
            <h1 className="mt-2 font-gemola text-3xl">Remote scanner</h1>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
              desktopConnected
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-white/15 bg-white/5 text-white/55"
            }`}
          >
            {desktopConnected ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {desktopConnected ? "Paired" : channelReady ? "Waiting" : "Connecting"}
          </div>
        </header>

        <section className="relative mt-5 aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-[13%] rounded-3xl border-2 border-white/85 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 text-sm text-white/80">
              <Camera className="h-8 w-8" />
              Starting camera…
            </div>
          )}
        </section>

        {cameraError ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            <CameraOff className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{cameraError}</span>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={switchCamera}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold uppercase tracking-[0.12em] transition hover:bg-white/10"
            >
              <SwitchCamera className="h-4 w-4" />
              Switch camera
            </button>
            <button
              type="button"
              onClick={() => setRestartKey((value) => value + 1)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold uppercase tracking-[0.12em] transition hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Restart
            </button>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          {lastScan ? (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">Sent to payment counter</div>
                <div className="mt-1 truncate font-mono text-[10px] text-white/55">
                  {lastScan}
                </div>
                {lastSentAt > 0 && (
                  <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/35">
                    {new Date(lastSentAt).toLocaleTimeString("en-LK")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-sm text-white/65">
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#62B6F3]" />
              <span>
                Keep this page open and point the rear camera at a Swara Ranjana
                ticket QR. The reservation will appear on the paired computer.
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
