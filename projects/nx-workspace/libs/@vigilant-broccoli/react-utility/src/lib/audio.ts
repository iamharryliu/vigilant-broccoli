let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioContext();
  }
  return sharedAudioCtx;
};

interface BeepOptions {
  frequency?: number;
  duration?: number;
  volume?: number;
  count?: number;
  gap?: number;
}

const DEFAULT_BEEP_INTERVAL_MS = 1000;

export const playBeep = async ({
  frequency = 800,
  duration = 0.5,
  volume = 0.3,
  count = 1,
  gap = 0,
}: BeepOptions = {}): Promise<void> => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  for (let i = 0; i < count; i++) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    const start = ctx.currentTime + i * (duration + gap);
    gainNode.gain.setValueAtTime(volume, start);
    gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }
};

export const createSoundAlert = (
  autoStopMs?: number,
  options?: BeepOptions,
): { start: () => void; stop: () => void } => {
  let stopRepeat: (() => void) | null = null;
  let stopTimeout: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    stopRepeat?.();
    stopRepeat = null;
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }
  };

  const start = () => {
    stop();
    stopRepeat = createRepeatingBeep(DEFAULT_BEEP_INTERVAL_MS, options);
    if (autoStopMs) stopTimeout = setTimeout(stop, autoStopMs);
  };

  return { start, stop };
};

export const createRepeatingBeep = (
  intervalMs: number = DEFAULT_BEEP_INTERVAL_MS,
  options?: BeepOptions,
): (() => void) => {
  playBeep(options);
  const interval = setInterval(() => playBeep(options), intervalMs);
  return () => clearInterval(interval);
};
