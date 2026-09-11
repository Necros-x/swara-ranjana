"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

const TARGET_VOLUME = 0.2;
const FADE_DURATION = 1800;

type AudioAmbiencePlayerProps = Record<never, never>;

export interface AudioAmbiencePlayerHandle {
  start: () => Promise<boolean>;
  stop: () => void;
}

export const AudioAmbiencePlayer = forwardRef<
  AudioAmbiencePlayerHandle,
  AudioAmbiencePlayerProps
>(function AudioAmbiencePlayer(_, ref) {
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/serene-concert-night.mp3");

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    audioRef.current = audio;
    audio.load();

    return () => {
      if (fadeFrameRef.current) {
        cancelAnimationFrame(fadeFrameRef.current);
      }

      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  const fadeVolume = useCallback(
    (
      from: number,
      to: number,
      duration: number,
      onComplete?: () => void,
    ) => {
      const audio = audioRef.current;

      if (!audio) return;

      if (fadeFrameRef.current) {
        cancelAnimationFrame(fadeFrameRef.current);
      }

      const startedAt = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);

        audio.volume = Math.max(
          0,
          Math.min(1, from + (to - from) * progress),
        );

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(animate);
        } else {
          fadeFrameRef.current = null;
          onComplete?.();
        }
      };

      fadeFrameRef.current = requestAnimationFrame(animate);
    },
    [],
  );

  const startAudio = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) return false;
    if (!audio.paused) {
      setIsPlaying(true);
      return true;
    }

    try {
      audio.volume = 0;
      await audio.play();

      fadeVolume(0, TARGET_VOLUME, FADE_DURATION);
      setIsPlaying(true);
      return true;
    } catch (error) {
      console.warn("Soundscape playback was blocked:", error);
      setIsPlaying(false);
      return false;
    }
  }, [fadeVolume]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    fadeVolume(audio.volume, 0, FADE_DURATION, () => {
      audio.pause();
    });

    setIsPlaying(false);
  }, [fadeVolume]);

  useImperativeHandle(
    ref,
    () => ({
      start: startAudio,
      stop: stopAudio,
    }),
    [startAudio, stopAudio],
  );

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      void startAudio();
    }
  };

  return (
    <div
      id="ambient-sound-toggle-container"
      className="fixed bottom-6 right-6 z-40 flex items-center"
    >
      <button
        id="ambient-sound-toggle-btn"
        type="button"
        onClick={toggleSound}
        className={`group flex items-center gap-3 rounded-full border px-3.5 py-2.5 text-xs font-medium uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${
          isPlaying
            ? "border-[#2271B1] bg-[#0E1721] text-[#FEFFFF] shadow-[0_8px_25px_rgba(34,113,177,0.25)]"
            : "border-[#C2CBD2]/60 bg-white/80 text-[#31465A] shadow-sm hover:bg-white hover:text-[#0E1721]"
        }`}
        title={
          isPlaying
            ? "Mute Serene Concert Night"
            : "Listen to Serene Concert Night"
        }
        aria-label={
          isPlaying
            ? "Mute concert soundscape"
            : "Play concert soundscape"
        }
        aria-pressed={isPlaying}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2271B1] opacity-75" />
          )}

          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isPlaying ? "bg-[#2271B1]" : "bg-[#7D8A95]"
            }`}
          />
        </span>

        {isPlaying ? (
          <Volume2 className="h-3.5 w-3.5 animate-pulse text-[#2271B1]" />
        ) : (
          <VolumeX className="h-3.5 w-3.5 text-[#7D8A95] group-hover:text-[#0E1721]" />
        )}

        <span className="hidden text-[10px] tracking-[0.2em] sm:inline">
          {isPlaying ? "Ambience Active" : "Soundscape"}
        </span>

        {isPlaying && (
          <div className="flex h-3 items-end gap-0.5">
            <span className="h-2 w-0.5 animate-[pulse_0.8s_ease-in-out_infinite] bg-[#2271B1]" />
            <span className="h-3 w-0.5 animate-[pulse_1.2s_ease-in-out_infinite] bg-white" />
            <span className="h-1.5 w-0.5 animate-[pulse_0.6s_ease-in-out_infinite] bg-[#2271B1]" />
          </div>
        )}
      </button>
    </div>
  );
});
