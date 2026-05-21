'use client';

import { Badge, Switch } from '@radix-ui/themes';
import { Button, Select } from '@vigilant-broccoli/react-lib';
import { BellOff, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { playBeep } from '../audio';

interface DurationOption {
  id: string;
  label: string;
  seconds: number;
}

const DURATION_OPTIONS: DurationOption[] = [
  { id: '3s', label: '3s', seconds: 3 },
  { id: '5m', label: '5m', seconds: 5 * 60 },
  { id: '10m', label: '10m', seconds: 10 * 60 },
  { id: '15m', label: '15m', seconds: 15 * 60 },
  { id: '20m', label: '20m', seconds: 20 * 60 },
  { id: '25m', label: '25m', seconds: 25 * 60 },
  { id: '30m', label: '30m', seconds: 30 * 60 },
];

const DEFAULT_FOCUS_OPTION_ID = '25m';
const DEFAULT_BREAK_OPTION_ID = '10m';

const findOption = (id: string): DurationOption =>
  DURATION_OPTIONS.find(o => o.id === id) ?? DURATION_OPTIONS[0];
const NOTIFICATION_FREQUENCY = 880;
const NOTIFICATION_DURATION = 0.15;
const NOTIFICATION_BEEP_COUNT = 3;
const NOTIFICATION_BEEP_GAP = 0.2;
const BREAK_BEEP_INTERVAL_MS = 1500;
const TIMED_ALERT_DURATION_MS = 15000;
const TICK_INTERVAL_MS = 250;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

const CIRCLE_SIZE = 200;
const CIRCLE_CENTER = CIRCLE_SIZE / 2;
const CIRCLE_RADIUS = 90;
const CIRCLE_STROKE_WIDTH = 8;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const ICON_SIZE = 16;

const POMODORO_STATE_EVENT = 'vb-pomodoro-state';
const POMODORO_COMMAND_EVENT = 'vb-pomodoro-command';
const STORAGE_KEY = 'vb-pomodoro-settings';
const CMD_TOGGLE = 'toggle';
const CMD_RESET = 'reset';
const CMD_SKIP = 'skip';
const CMD_DISMISS = 'dismiss';
const CMD_SET_FOCUS_DURATION = 'setFocusDuration';
const CMD_SET_BREAK_DURATION = 'setBreakDuration';
const CMD_SET_ALERT_MODE = 'setAlertMode';
const CMD_REQUEST_STATE = 'requestState';

const PHASE_TASK = 'task';
const PHASE_BREAK = 'break';
const ALERT_MODE_TIMED = 'timed';
const ALERT_MODE_PERSISTENT = 'persistent';

export type PomodoroPhase = typeof PHASE_TASK | typeof PHASE_BREAK;
export type AlertMode = typeof ALERT_MODE_TIMED | typeof ALERT_MODE_PERSISTENT;

const LABEL_PERSISTENT_ALERT = 'Persistent Alert';

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  [PHASE_TASK]: 'Focus Time',
  [PHASE_BREAK]: 'Break Time',
};

const PHASE_BADGE_COLOR: Record<PomodoroPhase, 'blue' | 'green'> = {
  [PHASE_TASK]: 'blue',
  [PHASE_BREAK]: 'green',
};

const PHASE_STROKE: Record<PomodoroPhase, string> = {
  [PHASE_TASK]: 'var(--blue-9)',
  [PHASE_BREAK]: 'var(--green-9)',
};

const LABEL_START = 'Start';
const LABEL_PAUSE = 'Pause';
const LABEL_RESET = 'Reset';
const LABEL_SKIP = 'Skip';
const LABEL_DISMISS = 'Dismiss';
const LABEL_FOCUS = 'Focus';
const LABEL_BREAK = 'Break';
const LABEL_COMPLETED_SUFFIX = 'completed';

const CURSOR_POINTER: CSSProperties = { cursor: 'pointer' };

const SETTINGS_LABEL_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
};

interface PomodoroState {
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedCount: number;
  alertMode: AlertMode;
  isAlerting: boolean;
  focusDurationId: string;
  breakDurationId: string;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getOppositePhase = (phase: PomodoroPhase): PomodoroPhase =>
  phase === PHASE_TASK ? PHASE_BREAK : PHASE_TASK;

const getDuration = (
  phase: PomodoroPhase,
  focusDurationId: string,
  breakDurationId: string,
): number =>
  findOption(phase === PHASE_TASK ? focusDurationId : breakDurationId).seconds;

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

interface PomodoroSettings {
  focusDurationId: string;
  breakDurationId: string;
  alertMode: AlertMode;
}

const isAlertMode = (v: unknown): v is AlertMode =>
  v === ALERT_MODE_TIMED || v === ALERT_MODE_PERSISTENT;

const isValidDurationId = (id: unknown): id is string =>
  typeof id === 'string' && DURATION_OPTIONS.some(o => o.id === id);

const loadSettings = (): Partial<PomodoroSettings> => {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as Partial<PomodoroSettings>;
  const settings: Partial<PomodoroSettings> = {};
  if (isValidDurationId(parsed.focusDurationId)) {
    settings.focusDurationId = parsed.focusDurationId;
  }
  if (isValidDurationId(parsed.breakDurationId)) {
    settings.breakDurationId = parsed.breakDurationId;
  }
  if (isAlertMode(parsed.alertMode)) {
    settings.alertMode = parsed.alertMode;
  }
  return settings;
};

const saveSettings = (state: PomodoroState) => {
  const settings: PomodoroSettings = {
    focusDurationId: state.focusDurationId,
    breakDurationId: state.breakDurationId,
    alertMode: state.alertMode,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const initialState: PomodoroState = {
  phase: PHASE_TASK,
  secondsLeft: findOption(DEFAULT_FOCUS_OPTION_ID).seconds,
  isRunning: false,
  completedCount: 0,
  alertMode: ALERT_MODE_TIMED,
  isAlerting: false,
  focusDurationId: DEFAULT_FOCUS_OPTION_ID,
  breakDurationId: DEFAULT_BREAK_OPTION_ID,
};

export const PomodoroEngine = () => {
  const stateRef = useRef<PomodoroState>(initialState);
  const endTimeRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = loadSettings();
    const hydrated: PomodoroState = { ...initialState, ...stored };
    hydrated.secondsLeft = findOption(hydrated.focusDurationId).seconds;
    stateRef.current = hydrated;

    const updateState = (patch: Partial<PomodoroState>) => {
      stateRef.current = { ...stateRef.current, ...patch };
      emitState(stateRef.current);
    };

    const persist = () => saveSettings(stateRef.current);

    const stopBeep = () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
      if (beepTimeoutRef.current) {
        clearTimeout(beepTimeoutRef.current);
        beepTimeoutRef.current = null;
      }
      updateState({ isAlerting: false });
    };

    const dismissAndResume = () => {
      const s = stateRef.current;
      stopBeep();
      if (!s.isRunning && endTimeRef.current === null) {
        endTimeRef.current = Date.now() + s.secondsLeft * MS_PER_SECOND;
        updateState({ isRunning: true });
      }
    };

    const startBeepLoop = (mode: AlertMode) => {
      stopBeep();
      updateState({ isAlerting: true });
      playNotificationSound();
      beepIntervalRef.current = setInterval(
        playNotificationSound,
        BREAK_BEEP_INTERVAL_MS,
      );
      if (mode === ALERT_MODE_TIMED) {
        beepTimeoutRef.current = setTimeout(
          dismissAndResume,
          TIMED_ALERT_DURATION_MS,
        );
      }
    };

    const advancePhase = (autoTransition: boolean) => {
      const s = stateRef.current;
      const nextPhase = getOppositePhase(s.phase);
      const completedCount =
        s.phase === PHASE_TASK ? s.completedCount + 1 : s.completedCount;
      const duration = getDuration(
        nextPhase,
        s.focusDurationId,
        s.breakDurationId,
      );
      isPausedRef.current = false;
      if (autoTransition) {
        if (!s.isAlerting) startBeepLoop(s.alertMode);
        endTimeRef.current = null;
        updateState({
          phase: nextPhase,
          secondsLeft: duration,
          isRunning: false,
          completedCount,
        });
      } else {
        endTimeRef.current = s.isRunning
          ? Date.now() + duration * MS_PER_SECOND
          : null;
        updateState({
          phase: nextPhase,
          secondsLeft: duration,
          completedCount,
        });
      }
    };

    const applyDurationChange = (
      payload: unknown,
      field: 'focusDurationId' | 'breakDurationId',
      activePhase: PomodoroPhase,
    ) => {
      const s = stateRef.current;
      const option = findOption(payload as string);
      const patch: Partial<PomodoroState> = { [field]: option.id };
      if (!s.isRunning && !isPausedRef.current && s.phase === activePhase) {
        patch.secondsLeft = option.seconds;
      }
      updateState(patch);
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
        advancePhase(true);
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
          isPausedRef.current = true;
          endTimeRef.current = null;
          updateState({ isRunning: false });
        } else {
          isPausedRef.current = false;
          endTimeRef.current = Date.now() + s.secondsLeft * MS_PER_SECOND;
          updateState({ isRunning: true });
        }
      },
      [CMD_RESET]: () => {
        const s = stateRef.current;
        stopBeep();
        isPausedRef.current = false;
        endTimeRef.current = null;
        updateState({
          isRunning: false,
          secondsLeft: getDuration(
            s.phase,
            s.focusDurationId,
            s.breakDurationId,
          ),
        });
      },
      [CMD_SKIP]: () => {
        stopBeep();
        advancePhase(false);
      },
      [CMD_DISMISS]: dismissAndResume,
      [CMD_SET_FOCUS_DURATION]: payload =>
        applyDurationChange(payload, 'focusDurationId', PHASE_TASK),
      [CMD_SET_BREAK_DURATION]: payload =>
        applyDurationChange(payload, 'breakDurationId', PHASE_BREAK),
      [CMD_SET_ALERT_MODE]: payload => {
        updateState({ alertMode: payload as AlertMode });
        persist();
      },
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

interface DurationSettingProps {
  label: string;
  value: string;
  disabled: boolean;
  command: string;
}

const DurationSetting = ({
  label,
  value,
  disabled,
  command,
}: DurationSettingProps) => (
  <div style={SETTINGS_LABEL_STYLE}>
    {label}
    <Select
      selectedOption={value}
      options={DURATION_OPTIONS.map(o => o.id)}
      setValue={id => sendCommand(command, id)}
      disabled={disabled}
      displayMapper={Object.fromEntries(
        DURATION_OPTIONS.map(o => [o.id, o.label]),
      )}
    />
  </div>
);

export const PomodoroUtilityContent = () => {
  const [state, setState] = useState<PomodoroState>(initialState);

  useEffect(() => {
    const onState = (e: Event) =>
      setState((e as CustomEvent<PomodoroState>).detail);
    window.addEventListener(POMODORO_STATE_EVENT, onState);
    sendCommand(CMD_REQUEST_STATE);
    return () => window.removeEventListener(POMODORO_STATE_EVENT, onState);
  }, []);

  const {
    phase,
    secondsLeft,
    isRunning,
    completedCount,
    alertMode,
    isAlerting,
    focusDurationId,
    breakDurationId,
  } = state;

  const totalSeconds = getDuration(phase, focusDurationId, breakDurationId);
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const strokeDashoffset =
    CIRCLE_CIRCUMFERENCE - (progress / 100) * CIRCLE_CIRCUMFERENCE;

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
            stroke={PHASE_STROKE[phase]}
            strokeWidth={CIRCLE_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div
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
        <Badge color={PHASE_BADGE_COLOR[phase]} size="2" variant="soft">
          {PHASE_LABELS[phase]}
        </Badge>
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

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        <Switch
          checked={alertMode === ALERT_MODE_PERSISTENT}
          onCheckedChange={checked =>
            sendCommand(
              CMD_SET_ALERT_MODE,
              checked ? ALERT_MODE_PERSISTENT : ALERT_MODE_TIMED,
            )
          }
        />
        {LABEL_PERSISTENT_ALERT}
      </label>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DurationSetting
          label={LABEL_FOCUS}
          value={focusDurationId}
          disabled={isRunning}
          command={CMD_SET_FOCUS_DURATION}
        />
        <DurationSetting
          label={LABEL_BREAK}
          value={breakDurationId}
          disabled={isRunning}
          command={CMD_SET_BREAK_DURATION}
        />
      </div>
    </div>
  );
};
