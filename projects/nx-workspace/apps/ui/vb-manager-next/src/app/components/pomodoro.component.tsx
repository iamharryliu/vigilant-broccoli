'use client';

import { useState } from 'react';
import { Button, Badge } from '@radix-ui/themes';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  BellOff,
  Settings,
} from 'lucide-react';
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

interface PomodoroComponentProps {
  pomodoro: ReturnType<typeof usePomodoro>;
}

// eslint-disable-next-line complexity
export const PomodoroComponent = ({ pomodoro }: PomodoroComponentProps) => {
  const {
    phase,
    secondsLeft,
    isRunning,
    completedCount,
    alertMode,
    isAlerting,
    focusMinutes,
    breakMinutes,
    setFocusMinutes,
    setBreakMinutes,
    setAlertMode,
    handleReset,
    handleSkip,
    handleToggleRunning,
    clearBeepLoop,
  } = pomodoro;

  const [showSettings, setShowSettings] = useState(false);

  const totalSeconds = phase === 'task' ? focusMinutes * 60 : breakMinutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
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

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
        <Badge
          color={showSettings ? 'blue' : 'gray'}
          variant={showSettings ? 'solid' : 'surface'}
          size="1"
          onClick={() => setShowSettings(prev => !prev)}
          style={{ cursor: 'pointer' }}
        >
          <Settings size={12} />
        </Badge>
      </div>

      {showSettings && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            Focus
            <input
              type="number"
              min={1}
              value={focusMinutes}
              onChange={e => setFocusMinutes(parseInt(e.target.value, 10) || 1)}
              disabled={isRunning}
              style={{
                width: '3.5rem',
                padding: '0.25rem 0.4rem',
                borderRadius: '6px',
                border: '1px solid var(--gray-6)',
                background: 'var(--gray-2)',
                textAlign: 'center',
                fontSize: '0.85rem',
              }}
            />
            min
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            Break
            <input
              type="number"
              min={1}
              value={breakMinutes}
              onChange={e => setBreakMinutes(parseInt(e.target.value, 10) || 1)}
              disabled={isRunning}
              style={{
                width: '3.5rem',
                padding: '0.25rem 0.4rem',
                borderRadius: '6px',
                border: '1px solid var(--gray-6)',
                background: 'var(--gray-2)',
                textAlign: 'center',
                fontSize: '0.85rem',
              }}
            />
            min
          </label>
        </div>
      )}
    </div>
  );
};
