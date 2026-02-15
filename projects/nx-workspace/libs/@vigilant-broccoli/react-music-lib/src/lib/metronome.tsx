import { useEffect, useRef, useState } from 'react';

const DEFAULT_MIN_BPM = 40;
const DEFAULT_MAX_BPM = 240;
const DEFAULT_BPM = 120;

export interface MetronomeProps {
  minBpm?: number;
  maxBpm?: number;
  defaultBpm?: number;
  className?: string;
}

export const Metronome = ({
  minBpm = DEFAULT_MIN_BPM,
  maxBpm = DEFAULT_MAX_BPM,
  defaultBpm = DEFAULT_BPM,
  className,
}: MetronomeProps) => {
  const initialBpm = Math.min(maxBpm, Math.max(minBpm, defaultBpm));

  const [bpm, setBpm] = useState(initialBpm);
  const [bpmInput, setBpmInput] = useState(String(initialBpm));
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatIndexRef = useRef(0);

  const ensureAudioContext = () => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  };

  const playClick = (accent: boolean) => {
    const audioContext = ensureAudioContext();
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = accent ? 1400 : 1000;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    oscillator.start(now);
    oscillator.stop(now + 0.06);
  };

  useEffect(() => {
    setBpmInput(String(bpm));
  }, [bpm]);

  const commitBpmInput = () => {
    const parsedValue = Number.parseInt(bpmInput, 10);
    if (Number.isNaN(parsedValue)) {
      setBpmInput(String(bpm));
      return;
    }

    const clampedValue = Math.min(maxBpm, Math.max(minBpm, parsedValue));
    setBpm(clampedValue);
    setBpmInput(String(clampedValue));
  };

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setActiveBeat(0);
      beatIndexRef.current = 0;
      return;
    }

    const tick = () => {
      const beatNumber = (beatIndexRef.current % 4) + 1;
      setActiveBeat(beatNumber);
      playClick(beatNumber === 1);
      beatIndexRef.current = beatNumber % 4;
    };

    tick();
    const intervalMs = 60000 / bpm;
    intervalRef.current = setInterval(tick, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bpm, isPlaying]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-500">BPM</span>
        <span className="font-mono text-3xl font-bold">{bpm}</span>
      </div>

      <input
        type="range"
        min={minBpm}
        max={maxBpm}
        value={bpm}
        onChange={event => setBpm(Number(event.target.value))}
        className="w-full mt-3"
        aria-label="Metronome BPM"
      />

      <div className="mt-3 flex items-end gap-2">
        <div className="flex flex-col gap-1" style={{ width: '100px' }}>
          <span className="text-xs text-gray-500">Set BPM</span>
          <input
            type="text"
            inputMode="numeric"
            value={bpmInput}
            onChange={event => {
              const nextValue = event.target.value;
              if (!/^\d*$/.test(nextValue)) {
                return;
              }
              setBpmInput(nextValue);
            }}
            onBlur={commitBpmInput}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                commitBpmInput();
              }
            }}
            className="h-8 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
          />
        </div>

        <button
          type="button"
          className="h-8 px-3 rounded-md border border-gray-300 dark:border-gray-700"
          onClick={() => setIsPlaying(prev => !prev)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="h-8 ml-auto flex items-center">
          <span
            className={`text-sm ${
              isPlaying ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
            }`}
          >
            {isPlaying
              ? `Playing ${bpm} BPM${
                  activeBeat > 0 ? ` • Beat ${activeBeat}` : ''
                }`
              : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  );
};
