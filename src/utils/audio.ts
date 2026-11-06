let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}

export function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.15): void {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainVal;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if Web Audio is blocked before user gesture
  }
}

/** Button click sound */
export function playClick(): void {
  playTone(800, 0.08, 'sine', 0.1);
}

/** Correct answer chime */
export function playCorrect(): void {
  playTone(523, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 200);
}

/** Wrong answer sound */
export function playWrong(): void {
  playTone(300, 0.2, 'sawtooth', 0.08);
  setTimeout(() => playTone(250, 0.3, 'sawtooth', 0.08), 150);
}

/** Star / positive feedback sound */
export function playStar(): void {
  playTone(880, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(1100, 0.1, 'sine', 0.1), 80);
  setTimeout(() => playTone(1320, 0.2, 'sine', 0.1), 160);
}

/** Final fanfare for victory / certificate */
export function playFanfare(): void {
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((freq, idx) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.1), idx * 120);
  });
}
