'use client';

import { Button, Badge } from '@radix-ui/themes';
import { Play, Pause, RotateCcw, SkipForward, BellOff } from 'lucide-react';
import { usePomodoro, PomodoroPhase, AlertMode } from '../hooks/usePomodoro';

const ALERT_MODE_LABELS: Record<AlertMode, string> = {
  timed: 'Timed Alert (15s)',
  persistent: 'Persistent Alert',
};

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getPhaseLabel = (phase: PomodoroPhase): string =>
  phase === 'task' ? 'Focus Time' : 'Break Time';

const TASK_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 10 * 60;

const getProgressPercent = (
  secondsLeft: number,
  phase: PomodoroPhase,
): number => {
  const total =
    phase === 'task' ? TASK_DURATION_SECONDS : BREAK_DURATION_SECONDS;
  return ((total - secondsLeft) / total) * 100;
};

interface PomodoroComponentProps {
  pomodoro: ReturnType<typeof usePomodoro>;
}

export const PomodoroComponent = ({ pomodoro }: PomodoroComponentProps) => {
  const {
    phase,
    secondsLeft,
    isRunning,
    completedCount,
    alertMode,
    isAlerting,
    setAlertMode,
    handleReset,
    handleSkip,
    handleToggleRunning,
    clearBeepLoop,
  } = pomodoro;

  const progress = getProgressPercent(secondsLeft, phase);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Badge
          color={phase === 'task' ? 'blue' : 'green'}
          size="2"
          variant="soft"
        >
          {getPhaseLabel(phase)}
        </Badge>
        {completedCount > 0 && (
          <Badge color="gray" size="1" variant="surface">
            {completedCount} completed
          </Badge>
        )}
      </div>

      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--gray-4)"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={phase === 'task' ? 'var(--blue-9)' : 'var(--green-9)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
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
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="soft"
          size="2"
          onClick={handleToggleRunning}
          style={{ cursor: 'pointer' }}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={handleReset}
          style={{ cursor: 'pointer' }}
        >
          <RotateCcw size={16} />
          Reset
        </Button>
        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={handleSkip}
          style={{ cursor: 'pointer' }}
        >
          <SkipForward size={16} />
          Skip
        </Button>
        {isAlerting && (
          <Button
            variant="soft"
            color="red"
            size="2"
            onClick={clearBeepLoop}
            style={{ cursor: 'pointer' }}
          >
            <BellOff size={16} />
            Dismiss
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(Object.keys(ALERT_MODE_LABELS) as AlertMode[]).map(mode => (
          <Badge
            key={mode}
            color={alertMode === mode ? 'blue' : 'gray'}
            variant={alertMode === mode ? 'solid' : 'surface'}
            size="1"
            onClick={() => setAlertMode(mode)}
            style={{ cursor: 'pointer' }}
          >
            {ALERT_MODE_LABELS[mode]}
          </Badge>
        ))}
      </div>
    </div>
  );
};
