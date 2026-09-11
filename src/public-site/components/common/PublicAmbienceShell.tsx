"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  AudioAmbiencePlayer,
  type AudioAmbiencePlayerHandle,
} from "./AudioAmbiencePlayer";

export function PublicAmbienceShell({ children }: { children: ReactNode }) {
  const audioPlayerRef = useRef<AudioAmbiencePlayerHandle>(null);

  useEffect(() => {
    let disposed = false;
    let removeGestureRetry = () => {};

    const attemptAutoplay = async () => {
      const started = (await audioPlayerRef.current?.start()) ?? false;

      if (disposed || started) return;

      const retryFromGesture = () => {
        removeGestureRetry();
        void audioPlayerRef.current?.start();
      };

      document.addEventListener("pointerdown", retryFromGesture, {
        capture: true,
      });
      document.addEventListener("keydown", retryFromGesture, {
        capture: true,
      });

      removeGestureRetry = () => {
        document.removeEventListener("pointerdown", retryFromGesture, {
          capture: true,
        });
        document.removeEventListener("keydown", retryFromGesture, {
          capture: true,
        });
      };
    };

    void attemptAutoplay();

    return () => {
      disposed = true;
      removeGestureRetry();
    };
  }, []);

  return (
    <>
      {children}
      <AudioAmbiencePlayer ref={audioPlayerRef} />
    </>
  );
}
