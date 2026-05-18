'use client';

import { Flex, Text } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { useState, useEffect, useRef } from 'react';
import { createSoundAlert } from '../audio';

const STORAGE_KEY = 'vb-manager-timer-state';
const ALERT_DURATION_MS = 5000;

const TIMER_EVENT = 'vb-timer-state';
const TIMER_COMMAND_EVENT = 'vb-timer-command';
const TIMER_NOTIFICATION_TAG = 'timer-notification';
const CMD_START = 'start';
const CMD_STOP = 'stop';
const CMD_RESET = 'reset';

interface TimerState {
  endTime: number;
  duration: number;
  currentRepetition: number;
  totalRepetitions: number;
  isRunning: boolean;
}

interface TimerUIState {
  remaining: number;
  isRunning: boolean;
  currentRepetition: number;
  totalRepetitions: number;
  duration: number;
  endTime: number;
}

const emitTimerState = (state: TimerUIState) => {
  window.dispatchEvent(new CustomEvent(TIMER_EVENT, { detail: state }));
};

const sendTimerCommand = (command: string, payload?: unknown) => {
  window.dispatchEvent(
    new CustomEvent(TIMER_COMMAND_EVENT, { detail: { command, payload } }),
  );
};

// TimerEngine: mount once at app level, never unmounts
export const TimerEngine = () => {
  const stateRef = useRef<TimerUIState>({
    remaining: 0,
    isRunning: false,
    currentRepetition: 0,
    totalRepetitions: 0,
    duration: 0,
    endTime: 0,
  });
  const notificationShownRef = useRef(false);
  const soundAlertRef = useRef(createSoundAlert(ALERT_DURATION_MS));

  const updateState = (patch: Partial<TimerUIState>) => {
    stateRef.current = { ...stateRef.current, ...patch };
    emitTimerState(stateRef.current);
  };

  const { start: startSound, stop: stopSound } = soundAlertRef.current;

  const showNotification = (current: number, total: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete', {
        body:
          current < total
            ? `Repetition ${current} of ${total} complete!`
            : 'All repetitions complete!',
        icon: '/favicon.ico',
        tag: TIMER_NOTIFICATION_TAG,
        requireInteraction: true,
      });
    }
  };

  const saveState = (state: TimerState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state: TimerState = JSON.parse(saved);
      if (state.isRunning && state.endTime > Date.now()) {
        updateState({
          endTime: state.endTime,
          duration: state.duration,
          currentRepetition: state.currentRepetition,
          totalRepetitions: state.totalRepetitions,
          isRunning: true,
          remaining: state.endTime - Date.now(),
        });
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const interval = setInterval(() => {
      const s = stateRef.current;
      if (!s.isRunning || s.endTime === 0) return;

      const now = Date.now();
      const remaining = s.endTime - now;

      if (remaining <= 0) {
        if (!notificationShownRef.current) {
          startSound();
          showNotification(s.currentRepetition, s.totalRepetitions);
          notificationShownRef.current = true;
        }

        if (s.currentRepetition < s.totalRepetitions) {
          const newEndTime = now + s.duration;
          const newRep = s.currentRepetition + 1;
          notificationShownRef.current = false;
          saveState({
            endTime: newEndTime,
            duration: s.duration,
            currentRepetition: newRep,
            totalRepetitions: s.totalRepetitions,
            isRunning: true,
          });
          updateState({
            endTime: newEndTime,
            currentRepetition: newRep,
            remaining: s.duration,
          });
        } else {
          localStorage.removeItem(STORAGE_KEY);
          updateState({ isRunning: false, remaining: 0 });
        }
      } else {
        updateState({ remaining });
      }
    }, 100);

    const onCommand = (e: Event) => {
      const { command, payload } = (e as CustomEvent).detail;

      if (command === CMD_START) {
        const { totalMs, repetitions } = payload;
        const newEndTime = Date.now() + totalMs;
        notificationShownRef.current = false;
        saveState({
          endTime: newEndTime,
          duration: totalMs,
          currentRepetition: 1,
          totalRepetitions: repetitions,
          isRunning: true,
        });
        updateState({
          endTime: newEndTime,
          duration: totalMs,
          remaining: totalMs,
          totalRepetitions: repetitions,
          currentRepetition: 1,
          isRunning: true,
        });
      }

      if (command === CMD_STOP) {
        stopSound();
        localStorage.removeItem(STORAGE_KEY);
        updateState({ isRunning: false });
      }

      if (command === CMD_RESET) {
        stopSound();
        localStorage.removeItem(STORAGE_KEY);
        notificationShownRef.current = false;
        updateState({
          isRunning: false,
          remaining: 0,
          currentRepetition: 0,
          totalRepetitions: 0,
          duration: 0,
          endTime: 0,
        });
      }
    };

    window.addEventListener(TIMER_COMMAND_EVENT, onCommand);

    return () => {
      clearInterval(interval);
      stopSound();
      window.removeEventListener(TIMER_COMMAND_EVENT, onCommand);
    };
  }, []);

  return null;
};

export const TimerUtilityContent = () => {
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');
  const [timerRepeat, setTimerRepeat] = useState('');
  const [uiState, setUiState] = useState<TimerUIState>({
    remaining: 0,
    isRunning: false,
    currentRepetition: 0,
    totalRepetitions: 0,
    duration: 0,
    endTime: 0,
  });

  useEffect(() => {
    const onState = (e: Event) =>
      setUiState((e as CustomEvent<TimerUIState>).detail);
    window.addEventListener(TIMER_EVENT, onState);
    return () => window.removeEventListener(TIMER_EVENT, onState);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const minutes = parseInt(timerMinutes) || 0;
    const seconds = parseInt(timerSeconds) || 0;
    const totalMs = (minutes * 60 + seconds) * 1000;
    const repetitions = parseInt(timerRepeat) || 1;
    if (totalMs > 0) {
      sendTimerCommand(CMD_START, { totalMs, repetitions });
    }
  };

  const { remaining, isRunning, currentRepetition, totalRepetitions } = uiState;
  const active = remaining > 0 || currentRepetition > 0;

  return (
    <>
      {active ? (
        <Flex direction="column" align="center" gap="2">
          <Text size="6" weight="bold" className="font-mono">
            {formatTime(remaining)}
          </Text>
          {totalRepetitions > 1 && (
            <Text size="2" color="gray">
              Repetition {currentRepetition} of {totalRepetitions}
            </Text>
          )}
          <Flex gap="2">
            <Button
              variant="secondary"
              onClick={() => sendTimerCommand(CMD_STOP)}
              disabled={!isRunning}
            >
              Stop
            </Button>
            <Button
              variant="outline"
              onClick={() => sendTimerCommand(CMD_RESET)}
            >
              Reset
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          <Flex gap="2" align="end">
            <Flex
              direction="column"
              gap="1"
              style={{ flex: '1 1 0', minWidth: 0 }}
            >
              <Text size="1" color="gray">
                Minutes
              </Text>
              <input
                type="number"
                min="0"
                value={timerMinutes}
                onChange={e => setTimerMinutes(e.target.value)}
                placeholder="0"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
              />
            </Flex>
            <Flex
              direction="column"
              gap="1"
              style={{ flex: '1 1 0', minWidth: 0 }}
            >
              <Text size="1" color="gray">
                Seconds
              </Text>
              <input
                type="number"
                min="0"
                max="59"
                value={timerSeconds}
                onChange={e => setTimerSeconds(e.target.value)}
                placeholder="0"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
              />
            </Flex>
            <Flex
              direction="column"
              gap="1"
              style={{ flex: '1 1 0', minWidth: 0 }}
            >
              <Text size="1" color="gray">
                Repeat
              </Text>
              <input
                type="number"
                min="1"
                value={timerRepeat}
                onChange={e => setTimerRepeat(e.target.value)}
                placeholder="1"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
              />
            </Flex>
          </Flex>
          <Button variant="secondary" onClick={handleStart}>
            Start Timer
          </Button>
        </Flex>
      )}
    </>
  );
};
