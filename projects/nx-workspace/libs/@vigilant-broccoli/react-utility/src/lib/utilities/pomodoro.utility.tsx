'use client';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Input,
  Switch,
} from '@vigilant-broccoli/react-lib';
import {
  BellOff,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
} from 'lucide-react';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { playBeep } from '../audio';

const NOTIFICATION_FREQUENCY = 880;
const NOTIFICATION_DURATION = 0.15;
const NOTIFICATION_BEEP_COUNT = 3;
const NOTIFICATION_BEEP_GAP = 0.2;
const BREAK_BEEP_INTERVAL_MS = 1500;
const TIMED_ALERT_DURATION_MS = 15000;
const TICK_INTERVAL_MS = 250;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MAX_MINUTES = 180;
const MAX_LONG_BREAK_EVERY = 12;

const CIRCLE_SIZE = 200;
const CIRCLE_CENTER = CIRCLE_SIZE / 2;
const CIRCLE_RADIUS = 90;
const CIRCLE_STROKE_WIDTH = 8;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const ICON_SIZE = 16;

const POMODORO_STATE_EVENT = 'vb-pomodoro-state';
const POMODORO_COMMAND_EVENT = 'vb-pomodoro-command';
const SETTINGS_STORAGE_KEY = 'vb-pomodoro-settings';
const TIMER_STORAGE_KEY = 'vb-pomodoro-timer';
const CMD_TOGGLE = 'toggle';
const CMD_RESET = 'reset';
const CMD_SKIP = 'skip';
const CMD_DISMISS = 'dismiss';
const CMD_UPDATE_SETTINGS = 'updateSettings';
const CMD_REQUEST_STATE = 'requestState';

export const POMODORO_MODE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
} as const;
const ALERT_MODE_TIMED = 'timed';
const ALERT_MODE_PERSISTENT = 'persistent';

export type PomodoroMode = (typeof POMODORO_MODE)[keyof typeof POMODORO_MODE];
export type AlertMode = typeof ALERT_MODE_TIMED | typeof ALERT_MODE_PERSISTENT;

type MinutesKey = PomodoroMode;

const MODES = Object.values(POMODORO_MODE);

const MODE_LABELS: Record<PomodoroMode, string> = {
  [POMODORO_MODE.WORK]: 'Focus Time',
  [POMODORO_MODE.SHORT_BREAK]: 'Short Break',
  [POMODORO_MODE.LONG_BREAK]: 'Long Break',
};

const MODE_BADGE_COLOR: Record<PomodoroMode, 'blue' | 'green' | 'purple'> = {
  [POMODORO_MODE.WORK]: 'blue',
  [POMODORO_MODE.SHORT_BREAK]: 'green',
  [POMODORO_MODE.LONG_BREAK]: 'purple',
};

const MODE_STROKE: Record<PomodoroMode, string> = {
  [POMODORO_MODE.WORK]: 'var(--blue-9)',
  [POMODORO_MODE.SHORT_BREAK]: 'var(--green-9)',
  [POMODORO_MODE.LONG_BREAK]: 'var(--purple-9)',
};

const MODE_NOTIFICATION: Record<PomodoroMode, string> = {
  [POMODORO_MODE.WORK]: 'Break over. Time to focus.',
  [POMODORO_MODE.SHORT_BREAK]: 'Time for a short break.',
  [POMODORO_MODE.LONG_BREAK]: 'Time for a long break.',
};

const MINUTE_FIELDS: { key: MinutesKey; label: string }[] = [
  { key: POMODORO_MODE.WORK, label: 'Focus (min)' },
  { key: POMODORO_MODE.SHORT_BREAK, label: 'Short break (min)' },
  { key: POMODORO_MODE.LONG_BREAK, label: 'Long break (min)' },
];

const LABEL_PERSISTENT_ALERT = 'Persistent Alert';
const LABEL_NOTIFICATIONS = 'Browser notifications';
const LABEL_NOTIFICATIONS_DENIED =
  'Notifications are blocked in this browser. Allow them in site settings.';
const LABEL_NOTIFICATIONS_UNSUPPORTED =
  'This browser does not support notifications.';
const LABEL_LONG_BREAK_EVERY = 'Long break every';
const LABEL_SETTINGS = 'Settings';
const LABEL_START = 'Start';
const LABEL_PAUSE = 'Pause';
const LABEL_RESET = 'Reset';
const LABEL_SKIP = 'Skip';
const LABEL_DISMISS = 'Dismiss';
const LABEL_COMPLETED_SUFFIX = 'completed';

const PERMISSION_GRANTED = 'granted';
const PERMISSION_DENIED = 'denied';
const PERMISSION_DEFAULT = 'default';
const PERMISSION_UNSUPPORTED = 'unsupported';

type NotificationSupport =
  NotificationPermission | typeof PERMISSION_UNSUPPORTED;

const CURSOR_POINTER: CSSProperties = { cursor: 'pointer' };

const SETTINGS_LABEL_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
};

const FADED_STAGE_OPACITY = 0.4;

const SETTINGS_PANEL_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const STAGE_SEQUENCE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
};

// Equal-width slots keep the current stage centered when there is no previous stage.
const STAGE_SLOT_STYLE: CSSProperties = {
  display: 'flex',
  minWidth: '6rem',
};

const NUMBER_INPUT_STYLE: CSSProperties = { width: '5rem' };

interface PomodoroSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakEvery: number;
  alertMode: AlertMode;
  notifications: boolean;
}

interface PomodoroState {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  completedCount: number;
  isAlerting: boolean;
  settings: PomodoroSettings;
}

interface StoredTimer {
  mode: PomodoroMode;
  completedCount: number;
  isRunning: boolean;
  secondsLeft: number;
  endsAt: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
  alertMode: ALERT_MODE_TIMED,
  notifications: false,
};

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getDuration = (mode: PomodoroMode, settings: PomodoroSettings): number =>
  settings[mode] * SECONDS_PER_MINUTE;

const getNextMode = (
  mode: PomodoroMode,
  completedCount: number,
  settings: PomodoroSettings,
): PomodoroMode => {
  if (mode !== POMODORO_MODE.WORK) return POMODORO_MODE.WORK;
  return completedCount % settings.longBreakEvery === 0
    ? POMODORO_MODE.LONG_BREAK
    : POMODORO_MODE.SHORT_BREAK;
};

// Stage before the current one; null before the first focus session ends.
const getPreviousMode = (
  mode: PomodoroMode,
  completedCount: number,
  settings: PomodoroSettings,
): PomodoroMode | null => {
  if (mode !== POMODORO_MODE.WORK) return POMODORO_MODE.WORK;
  return completedCount > 0
    ? getNextMode(POMODORO_MODE.WORK, completedCount, settings)
    : null;
};

const getFollowingMode = (
  mode: PomodoroMode,
  completedCount: number,
  settings: PomodoroSettings,
): PomodoroMode =>
  mode === POMODORO_MODE.WORK
    ? getNextMode(mode, completedCount + 1, settings)
    : POMODORO_MODE.WORK;

const getNotificationSupport = (): NotificationSupport =>
  typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : PERMISSION_UNSUPPORTED;

const playNotificationSound = (): void => {
  playBeep({
    frequency: NOTIFICATION_FREQUENCY,
    duration: NOTIFICATION_DURATION,
    count: NOTIFICATION_BEEP_COUNT,
    gap: NOTIFICATION_BEEP_GAP,
  });
};

const emitState = (state: PomodoroState) => {
  window.dispatchEvent(
    new CustomEvent(POMODORO_STATE_EVENT, { detail: state }),
  );
};

const sendCommand = (command: string, payload?: unknown) => {
  window.dispatchEvent(
    new CustomEvent(POMODORO_COMMAND_EVENT, { detail: { command, payload } }),
  );
};

const clampInt = (value: unknown, fallback: number, max: number): number => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, max) : fallback;
};

const readJson = (key: string): Record<string, unknown> => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
};

const loadSettings = (): PomodoroSettings => {
  const stored = readJson(SETTINGS_STORAGE_KEY);
  return {
    work: clampInt(stored.work, DEFAULT_SETTINGS.work, MAX_MINUTES),
    shortBreak: clampInt(
      stored.shortBreak,
      DEFAULT_SETTINGS.shortBreak,
      MAX_MINUTES,
    ),
    longBreak: clampInt(
      stored.longBreak,
      DEFAULT_SETTINGS.longBreak,
      MAX_MINUTES,
    ),
    longBreakEvery: clampInt(
      stored.longBreakEvery,
      DEFAULT_SETTINGS.longBreakEvery,
      MAX_LONG_BREAK_EVERY,
    ),
    alertMode:
      stored.alertMode === ALERT_MODE_PERSISTENT
        ? ALERT_MODE_PERSISTENT
        : ALERT_MODE_TIMED,
    notifications: stored.notifications === true,
  };
};

const freshState = (
  settings: PomodoroSettings,
  mode: PomodoroMode,
  completedCount: number,
): PomodoroState => ({
  mode,
  secondsLeft: getDuration(mode, settings),
  isRunning: false,
  completedCount,
  isAlerting: false,
  settings,
});

// Resumes a running timer from its absolute end time. A session that ended
// while the page was closed finishes silently so no stale alert fires.
const loadTimer = (
  settings: PomodoroSettings,
): { state: PomodoroState; endsAt: number | null } => {
  const stored = readJson(TIMER_STORAGE_KEY) as Partial<StoredTimer>;
  const mode = stored.mode;
  if (!mode || !MODES.includes(mode)) {
    return { state: freshState(settings, POMODORO_MODE.WORK, 0), endsAt: null };
  }
  const completedCount = Math.max(
    0,
    Math.floor(Number(stored.completedCount)) || 0,
  );
  const duration = getDuration(mode, settings);
  if (stored.isRunning === true && Number.isFinite(stored.endsAt)) {
    const endsAt = stored.endsAt as number;
    if (endsAt > Date.now()) {
      return {
        state: {
          ...freshState(settings, mode, completedCount),
          isRunning: true,
          secondsLeft: Math.min(
            duration,
            Math.ceil((endsAt - Date.now()) / MS_PER_SECOND),
          ),
        },
        endsAt,
      };
    }
    const count =
      mode === POMODORO_MODE.WORK ? completedCount + 1 : completedCount;
    return {
      state: freshState(settings, getNextMode(mode, count, settings), count),
      endsAt: null,
    };
  }
  const secondsLeft = Math.floor(Number(stored.secondsLeft));
  const state = freshState(settings, mode, completedCount);
  if (secondsLeft >= 1 && secondsLeft <= duration)
    state.secondsLeft = secondsLeft;
  return { state, endsAt: null };
};

const saveTimer = (state: PomodoroState, endsAt: number | null) => {
  const timer: StoredTimer = {
    mode: state.mode,
    completedCount: state.completedCount,
    isRunning: state.isRunning,
    secondsLeft: state.secondsLeft,
    endsAt: state.isRunning && endsAt ? endsAt : 0,
  };
  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
};

const showNotification = (mode: PomodoroMode) => {
  if (getNotificationSupport() === PERMISSION_GRANTED) {
    new Notification(MODE_NOTIFICATION[mode]);
  }
};

const initialState: PomodoroState = freshState(
  DEFAULT_SETTINGS,
  POMODORO_MODE.WORK,
  0,
);

export const PomodoroEngine = () => {
  const stateRef = useRef<PomodoroState>(initialState);
  const endTimeRef = useRef<number | null>(null);
  const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const persist = () => {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(stateRef.current.settings),
      );
      saveTimer(stateRef.current, endTimeRef.current);
    };

    const updateState = (patch: Partial<PomodoroState>) => {
      stateRef.current = { ...stateRef.current, ...patch };
      emitState(stateRef.current);
      saveTimer(stateRef.current, endTimeRef.current);
    };

    const hydrated = loadTimer(loadSettings());
    stateRef.current = hydrated.state;
    endTimeRef.current = hydrated.endsAt;

    const stopBeep = () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
      if (beepTimeoutRef.current) {
        clearTimeout(beepTimeoutRef.current);
        beepTimeoutRef.current = null;
      }
      if (stateRef.current.isAlerting) updateState({ isAlerting: false });
    };

    const dismissAndResume = () => {
      const s = stateRef.current;
      stopBeep();
      if (!s.isRunning && endTimeRef.current === null) {
        endTimeRef.current = Date.now() + s.secondsLeft * MS_PER_SECOND;
        updateState({ isRunning: true });
      }
    };

    const startBeepLoop = (alertMode: AlertMode) => {
      stopBeep();
      updateState({ isAlerting: true });
      playNotificationSound();
      beepIntervalRef.current = setInterval(
        playNotificationSound,
        BREAK_BEEP_INTERVAL_MS,
      );
      if (alertMode === ALERT_MODE_TIMED) {
        beepTimeoutRef.current = setTimeout(
          dismissAndResume,
          TIMED_ALERT_DURATION_MS,
        );
      }
    };

    const advanceMode = (finished: boolean) => {
      const s = stateRef.current;
      const completedCount =
        s.mode === POMODORO_MODE.WORK ? s.completedCount + 1 : s.completedCount;
      const nextMode = getNextMode(s.mode, completedCount, s.settings);
      const secondsLeft = getDuration(nextMode, s.settings);
      if (finished) {
        if (!s.isAlerting) startBeepLoop(s.settings.alertMode);
        if (s.settings.notifications) showNotification(nextMode);
        endTimeRef.current = null;
        updateState({
          mode: nextMode,
          secondsLeft,
          isRunning: false,
          completedCount,
        });
      } else {
        endTimeRef.current = s.isRunning
          ? Date.now() + secondsLeft * MS_PER_SECOND
          : null;
        updateState({ mode: nextMode, secondsLeft, completedCount });
      }
    };

    // Editing a duration only reshapes a session that has not been started
    // or paused part-way, so a paused countdown keeps its remaining time.
    const applySettings = (patch: Partial<PomodoroSettings>) => {
      const s = stateRef.current;
      const settings = { ...s.settings, ...patch };
      const untouched =
        !s.isRunning && s.secondsLeft === getDuration(s.mode, s.settings);
      updateState({
        settings,
        ...(untouched ? { secondsLeft: getDuration(s.mode, settings) } : {}),
      });
      persist();
    };

    emitState(stateRef.current);

    const interval = setInterval(() => {
      const s = stateRef.current;
      if (!s.isRunning) return;
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + s.secondsLeft * MS_PER_SECOND;
      }
      const remaining = Math.ceil(
        (endTimeRef.current - Date.now()) / MS_PER_SECOND,
      );
      if (remaining <= 0) {
        advanceMode(true);
      } else if (remaining !== s.secondsLeft) {
        updateState({ secondsLeft: remaining });
      }
    }, TICK_INTERVAL_MS);

    const handlers: Record<string, (payload: unknown) => void> = {
      [CMD_TOGGLE]: () => {
        const s = stateRef.current;
        if (s.isAlerting) {
          dismissAndResume();
          return;
        }
        if (s.isRunning) {
          endTimeRef.current = null;
          updateState({ isRunning: false });
        } else {
          endTimeRef.current = Date.now() + s.secondsLeft * MS_PER_SECOND;
          updateState({ isRunning: true });
        }
      },
      [CMD_RESET]: () => {
        const s = stateRef.current;
        stopBeep();
        endTimeRef.current = null;
        updateState({
          isRunning: false,
          secondsLeft: getDuration(s.mode, s.settings),
        });
      },
      [CMD_SKIP]: () => {
        stopBeep();
        advanceMode(false);
      },
      [CMD_DISMISS]: dismissAndResume,
      [CMD_UPDATE_SETTINGS]: payload =>
        applySettings(payload as Partial<PomodoroSettings>),
      [CMD_REQUEST_STATE]: () => emitState(stateRef.current),
    };

    const onCommand = (e: Event) => {
      const { command, payload } = (e as CustomEvent).detail;
      handlers[command]?.(payload);
    };

    window.addEventListener(POMODORO_COMMAND_EVENT, onCommand);

    return () => {
      clearInterval(interval);
      stopBeep();
      window.removeEventListener(POMODORO_COMMAND_EVENT, onCommand);
    };
  }, []);

  return null;
};

interface MinutesSettingProps {
  label: string;
  value: number;
  max: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}

// Keeps a draft so the field can be cleared while typing; only valid
// whole numbers reach the engine.
const MinutesSetting = ({
  label,
  value,
  max,
  disabled,
  onCommit,
}: MinutesSettingProps) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  return (
    <label style={SETTINGS_LABEL_STYLE}>
      {label}
      <Input
        type="number"
        min={1}
        max={max}
        value={draft}
        disabled={disabled}
        style={NUMBER_INPUT_STYLE}
        onChange={e => {
          setDraft(e.target.value);
          const n = Math.floor(Number(e.target.value));
          if (n >= 1 && n <= max) onCommit(n);
        }}
        onBlur={() => setDraft(String(value))}
      />
    </label>
  );
};

export const PomodoroUtilityContent = () => {
  const [state, setState] = useState<PomodoroState>(initialState);
  const [permission, setPermission] = useState<NotificationSupport>(
    PERMISSION_UNSUPPORTED,
  );

  useEffect(() => {
    const onState = (e: Event) =>
      setState((e as CustomEvent<PomodoroState>).detail);
    window.addEventListener(POMODORO_STATE_EVENT, onState);
    sendCommand(CMD_REQUEST_STATE);
    setPermission(getNotificationSupport());
    return () => window.removeEventListener(POMODORO_STATE_EVENT, onState);
  }, []);

  const { mode, secondsLeft, isRunning, completedCount, isAlerting, settings } =
    state;

  const updateSettings = (patch: Partial<PomodoroSettings>) =>
    sendCommand(CMD_UPDATE_SETTINGS, patch);

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && permission === PERMISSION_DEFAULT) {
      setPermission(await Notification.requestPermission());
    }
    updateSettings({ notifications: enabled });
  };

  const previousMode = getPreviousMode(mode, completedCount, settings);
  const nextMode = getFollowingMode(mode, completedCount, settings);
  const totalSeconds = getDuration(mode, settings);
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const strokeDashoffset =
    CIRCLE_CIRCUMFERENCE - (progress / 100) * CIRCLE_CIRCUMFERENCE;
  const notificationsUnavailable =
    permission === PERMISSION_UNSUPPORTED || permission === PERMISSION_DENIED;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${CIRCLE_SIZE}px`,
          height: `${CIRCLE_SIZE}px`,
        }}
      >
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="var(--gray-4)"
            strokeWidth={CIRCLE_STROKE_WIDTH}
          />
          <circle
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={MODE_STROKE[mode]}
            strokeWidth={CIRCLE_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div
          role="timer"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <div style={STAGE_SEQUENCE_STYLE}>
          <div style={{
              ...STAGE_SLOT_STYLE,
              justifyContent: 'flex-end',
              opacity: FADED_STAGE_OPACITY,
            }}>
            {previousMode && (
              <Badge
                color={MODE_BADGE_COLOR[previousMode]}
                size="1"
                variant="soft"
              >
                {MODE_LABELS[previousMode]}
              </Badge>
            )}
          </div>
          <Badge color={MODE_BADGE_COLOR[mode]} size="2" variant="soft">
            {MODE_LABELS[mode]}
          </Badge>
          <div style={{ ...STAGE_SLOT_STYLE, opacity: FADED_STAGE_OPACITY }}>
            <Badge color={MODE_BADGE_COLOR[nextMode]} size="1" variant="soft">
              {MODE_LABELS[nextMode]}
            </Badge>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--gray-10)' }}>
          {completedCount} {LABEL_COMPLETED_SUFFIX}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="secondary"
          onClick={() => sendCommand(CMD_TOGGLE)}
          style={CURSOR_POINTER}
        >
          {isRunning ? <Pause size={ICON_SIZE} /> : <Play size={ICON_SIZE} />}
          {isRunning ? LABEL_PAUSE : LABEL_START}
        </Button>
        <Button
          variant="secondary"
          onClick={() => sendCommand(CMD_RESET)}
          style={CURSOR_POINTER}
        >
          <RotateCcw size={ICON_SIZE} />
          {LABEL_RESET}
        </Button>
        <Button
          variant="secondary"
          onClick={() => sendCommand(CMD_SKIP)}
          style={CURSOR_POINTER}
        >
          <SkipForward size={ICON_SIZE} />
          {LABEL_SKIP}
        </Button>
        {isAlerting && (
          <Button
            variant="destructive"
            onClick={() => sendCommand(CMD_DISMISS)}
            style={CURSOR_POINTER}
          >
            <BellOff size={ICON_SIZE} />
            {LABEL_DISMISS}
          </Button>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            aria-label={LABEL_SETTINGS}
            style={CURSOR_POINTER}
          >
            <Settings size={ICON_SIZE} />
            {LABEL_SETTINGS}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{LABEL_SETTINGS}</DialogTitle>
          <DialogDescription className="sr-only">
            {LABEL_SETTINGS}
          </DialogDescription>
          <div style={SETTINGS_PANEL_STYLE}>
            <label style={{ ...SETTINGS_LABEL_STYLE, cursor: 'pointer' }}>
              <Switch
                checked={settings.alertMode === ALERT_MODE_PERSISTENT}
                onCheckedChange={checked =>
                  updateSettings({
                    alertMode: checked
                      ? ALERT_MODE_PERSISTENT
                      : ALERT_MODE_TIMED,
                  })
                }
              />
              {LABEL_PERSISTENT_ALERT}
            </label>

            <label style={{ ...SETTINGS_LABEL_STYLE, cursor: 'pointer' }}>
              <Switch
                checked={
                  settings.notifications && permission === PERMISSION_GRANTED
                }
                disabled={notificationsUnavailable}
                onCheckedChange={toggleNotifications}
              />
              {LABEL_NOTIFICATIONS}
            </label>
            {permission === PERMISSION_DENIED && (
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-10)' }}>
                {LABEL_NOTIFICATIONS_DENIED}
              </div>
            )}
            {permission === PERMISSION_UNSUPPORTED && (
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-10)' }}>
                {LABEL_NOTIFICATIONS_UNSUPPORTED}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                alignItems: 'flex-end',
              }}
            >
              {MINUTE_FIELDS.map(({ key, label }) => (
                <MinutesSetting
                  key={key}
                  label={label}
                  value={settings[key]}
                  max={MAX_MINUTES}
                  disabled={isRunning}
                  onCommit={value =>
                    updateSettings({
                      [key]: value,
                    } as Partial<PomodoroSettings>)
                  }
                />
              ))}
              <MinutesSetting
                label={LABEL_LONG_BREAK_EVERY}
                value={settings.longBreakEvery}
                max={MAX_LONG_BREAK_EVERY}
                disabled={isRunning}
                onCommit={value => updateSettings({ longBreakEvery: value })}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
