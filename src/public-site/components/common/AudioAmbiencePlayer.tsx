import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export const AudioAmbiencePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    oscillators: OscillatorNode[];
    gains: GainNode[];
    masterGain: GainNode | null;
  }>({
    oscillators: [],
    gains: [],
    masterGain: null,
  });

  const stopAudio = () => {
    try {
      nodesRef.current.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      nodesRef.current.oscillators = [];
      nodesRef.current.gains = [];
      if (nodesRef.current.masterGain) {
        nodesRef.current.masterGain.disconnect();
        nodesRef.current.masterGain = null;
      }
      setIsPlaying(false);
    } catch {
      setIsPlaying(false);
    }
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3);
      master.connect(ctx.destination);
      nodesRef.current.masterGain = master;

      // Ethereal Sa-Pa Tanpura & Chime drone harmonic ratios (D2: 73.42Hz, A2: 110Hz, D3: 146.83Hz, F#3: 185Hz, A3: 220Hz, D4: 293.66Hz)
      const freqs = [73.42, 110.0, 146.83, 220.0, 293.66, 440.0];
      const oscs: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        // Warm sine and subtle triangle harmonic
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), ctx.currentTime);

        // Gentle undulating LFO amplitude
        const volume = (1 / (idx + 1.2)) * 0.18;
        g.gain.setValueAtTime(volume, ctx.currentTime);

        osc.connect(g);
        g.connect(master);
        osc.start();

        oscs.push(osc);
        gains.push(g);
      });

      nodesRef.current.oscillators = oscs;
      nodesRef.current.gains = gains;
      setIsPlaying(true);
    } catch (err) {
      console.warn('Audio playback not supported or user blocked', err);
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      id="ambient-sound-toggle-container"
      className="fixed bottom-6 right-6 z-40 flex items-center"
    >
      <button
        id="ambient-sound-toggle-btn"
        onClick={toggleSound}
        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-full backdrop-blur-md transition-all duration-300 border text-xs tracking-wider uppercase font-medium ${
          isPlaying
            ? 'bg-[#0E1721] text-[#FEFFFF] border-[#2271B1] shadow-[0_8px_25px_rgba(34,113,177,0.25)]'
            : 'bg-white/80 hover:bg-white text-[#31465A] hover:text-[#0E1721] border-[#C2CBD2]/60 shadow-sm'
        }`}
        title={isPlaying ? 'Mute Ethereal Ambience' : 'Listen to Concert Ambience'}
        aria-label="Concert Ambience"
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2271B1] opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isPlaying ? 'bg-[#2271B1]' : 'bg-[#7D8A95]'
            }`}
          ></span>
        </span>

        {isPlaying ? (
          <Volume2 className="w-3.5 h-3.5 text-[#2271B1] animate-pulse" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-[#7D8A95] group-hover:text-[#0E1721]" />
        )}

        <span className="hidden sm:inline text-[10px] tracking-[0.2em]">
          {isPlaying ? 'Ambience Active' : 'Soundscape'}
        </span>

        {/* Animated mini visualizer bars */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-[#2271B1] animate-[pulse_0.8s_ease-in-out_infinite] h-2"></span>
            <span className="w-0.5 bg-white animate-[pulse_1.2s_ease-in-out_infinite] h-3"></span>
            <span className="w-0.5 bg-[#2271B1] animate-[pulse_0.6s_ease-in-out_infinite] h-1.5"></span>
          </div>
        )}
      </button>
    </div>
  );
};
