export let hoverAudioCtx: AudioContext | null = null;

export const playHoverChime = () => {
  try {
    if (typeof window === 'undefined') return;

    if (!hoverAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      hoverAudioCtx = new AudioCtx();
    }
    
    if (hoverAudioCtx.state === 'suspended') {
      hoverAudioCtx.resume().catch(() => {});
      if (hoverAudioCtx.state === 'suspended') return;
    }

    const t = hoverAudioCtx.currentTime;
    
    const osc = hoverAudioCtx.createOscillator();
    const gainNode = hoverAudioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880.00, t); // A5
    
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.08, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    
    const osc2 = hoverAudioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, t); // E6
    
    const gainNode2 = hoverAudioCtx.createGain();
    gainNode2.gain.setValueAtTime(0, t);
    gainNode2.gain.linearRampToValueAtTime(0.05, t + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    
    osc.connect(gainNode);
    osc2.connect(gainNode2);
    
    gainNode.connect(hoverAudioCtx.destination);
    gainNode2.connect(hoverAudioCtx.destination);
    
    osc.start(t);
    osc.stop(t + 1.2);
    
    osc2.start(t);
    osc2.stop(t + 1.5);

  } catch (error) {
    console.debug('Hover chime blocked:', error);
  }
};
