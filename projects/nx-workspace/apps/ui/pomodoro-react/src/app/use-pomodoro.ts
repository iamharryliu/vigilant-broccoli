import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'pomodoro:v1';
const STATE_STORAGE_KEY = 'pomodoro:v1:state';
const SECONDS_PER_MINUTE = 60;
const TICK_MS = 250;
const SESSION_BEEP_HZ = 880;
const BEEP_SECONDS = 0.6;

export const MODE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
} as const;
export type Mode = (typeof MODE)[keyof typeof MODE];

export type Settings = {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakEvery: number;
  sound: boolean;
  notifications: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
  sound: true,
  notifications: false,
};

const MINUTE_KEYS = [MODE.WORK, MODE.SHORT_BREAK, MODE.LONG_BREAK] as const;

function clampInt(value: unknown, fallback: number, max: number) {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, max) : fallback;
}

function readSettings(): Settings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      work: clampInt(stored.work, DEFAULT_SETTINGS.work, 180),
      shortBreak: clampInt(stored.shortBreak, DEFAULT_SETTINGS.shortBreak, 180),
      longBreak: clampInt(stored.longBreak, DEFAULT_SETTINGS.longBreak, 180),
      longBreakEvery: clampInt(
        stored.longBreakEvery,
        DEFAULT_SETTINGS.longBreakEvery,
        12,
      ),
      sound: stored.sound !== false,
      notifications: stored.notifications === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

type TimerState = {
  mode: Mode;
  completed: number;
  running: boolean;
  remaining: number;
  endsAt: number;
};

const MODES = Object.values(MODE);

function nextModeAfter(mode: Mode, count: number, settings: Settings): Mode {
  if (mode !== MODE.WORK) return MODE.WORK;
  return count % settings.longBreakEvery === 0
    ? MODE.LONG_BREAK
    : MODE.SHORT_BREAK;
}

function freshState(settings: Settings, mode: Mode, completed: number) {
  const remaining = settings[mode] * SECONDS_PER_MINUTE;
  return { mode, completed, running: false, remaining, endsAt: 0 };
}

function readState(settings: Settings): TimerState {
  const fresh = freshState(settings, MODE.WORK, 0);
  try {
    const stored = JSON.parse(localStorage.getItem(STATE_STORAGE_KEY) ?? '{}');
    if (!MODES.includes(stored.mode)) return fresh;
    const mode: Mode = stored.mode;
    const completed = Math.max(0, Math.floor(Number(stored.completed)) || 0);
    if (stored.running === true && Number.isFinite(stored.endsAt)) {
      if (stored.endsAt > Date.now()) {
        return {
          mode,
          completed,
          running: true,
          remaining: Math.ceil((stored.endsAt - Date.now()) / 1000),
          endsAt: stored.endsAt,
        };
      }
      // The session ended while the page was closed: finish it without a late alert.
      const count = mode === MODE.WORK ? completed + 1 : completed;
      return freshState(settings, nextModeAfter(mode, count, settings), count);
    }
    const remaining = Math.floor(Number(stored.remaining));
    if (!(remaining >= 1 && remaining <= settings[mode] * SECONDS_PER_MINUTE))
      return freshState(settings, mode, completed);
    return { mode, completed, running: false, remaining, endsAt: 0 };
  } catch {
    return fresh;
  }
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function beep() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = SESSION_BEEP_HZ;
    gain.gain.setValueAtTime(0.2, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + BEEP_SECONDS,
    );
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + BEEP_SECONDS);
    oscillator.onended = () => context.close();
  } catch {
    // Audio can be blocked or unsupported; the notification and title still signal completion.
  }
}

export function usePomodoro(notify: (mode: Mode) => string) {
  const [settings, setSettingsState] = useState(readSettings);
  const [storageError, setStorageError] = useState(false);
  const [initial] = useState(() => readState(settings));
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [completed, setCompleted] = useState(initial.completed);
  const [running, setRunning] = useState(initial.running);
  const [remaining, setRemaining] = useState(initial.remaining);
  const endsAt = useRef(initial.endsAt);
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const duration = (target: Mode, source = settings) =>
    source[target] * SECONDS_PER_MINUTE;

  const enter = (target: Mode, autoStart: boolean, source = settings) => {
    setMode(target);
    setRemaining(duration(target, source));
    endsAt.current = Date.now() + duration(target, source) * 1000;
    setRunning(autoStart);
  };

  const advance = (finished: boolean) => {
    const count = mode === MODE.WORK ? completed + 1 : completed;
    if (mode === MODE.WORK) setCompleted(count);
    const target = nextModeAfter(mode, count, settings);
    if (finished) {
      if (settings.sound) beep();
      if (settings.notifications && 'Notification' in window) {
        if (Notification.permission === 'granted')
          new Notification(notifyRef.current(target));
      }
    }
    enter(target, false);
  };
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) advanceRef.current(true);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STATE_STORAGE_KEY,
        JSON.stringify({
          mode,
          completed,
          running,
          remaining,
          endsAt: running ? endsAt.current : 0,
        }),
      );
    } catch {
      // Timer state is best-effort; settings writes already surface storage errors.
    }
  }, [mode, completed, running, remaining]);

  const start = () => {
    endsAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  };

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettingsState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    if (!running && MINUTE_KEYS.some(key => key in patch)) {
      setRemaining(duration(mode, next));
    }
  };

  return {
    settings,
    storageError,
    mode,
    completed,
    running,
    remaining,
    start,
    pause: () => setRunning(false),
    reset: () => enter(mode, false),
    skip: () => advance(false),
    resetAll: () => {
      setCompleted(0);
      enter(MODE.WORK, false);
    },
    updateSettings,
  };
}
