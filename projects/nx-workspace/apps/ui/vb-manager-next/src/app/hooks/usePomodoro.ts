'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 10;
const NOTIFICATION_FREQUENCY = 880;
const NOTIFICATION_DURATION = 0.15;
const NOTIFICATION_BEEP_COUNT = 3;
const NOTIFICATION_BEEP_GAP = 0.2;
const BREAK_BEEP_INTERVAL_MS = 1500;
const TIMED_ALERT_DURATION_MS = 15000;
const TICK_INTERVAL_MS = 250;

export type PomodoroPhase = 'task' | 'break';
export type AlertMode = 'timed' | 'persistent';

let audioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

const playNotificationSound = (): void => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  for (let i = 0; i < NOTIFICATION_BEEP_COUNT; i++) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = NOTIFICATION_FREQUENCY;
    oscillator.type = 'sine';
    const start = ctx.currentTime + i * NOTIFICATION_BEEP_GAP;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + NOTIFICATION_DURATION);
    oscillator.start(start);
    oscillator.stop(start + NOTIFICATION_DURATION);
  }
};

export const usePomodoro = () => {
  const [focusMinutes, setFocusMinutesState] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutesState] = useState(DEFAULT_BREAK_MINUTES);

  const getDuration = useCallback(
    (p: PomodoroPhase): number =>
      p === 'task' ? focusMinutes * 60 : breakMinutes * 60,
    [focusMinutes, breakMinutes],
  );

  const [phase, setPhase] = useState<PomodoroPhase>('task');
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [alertMode, setAlertMode] = useState<AlertMode>('timed');
  const [isAlerting, setIsAlerting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const alertModeRef = useRef(alertMode);
  const isAlertingRef = useRef(isAlerting);

  phaseRef.current = phase;
  alertModeRef.current = alertMode;
  isAlertingRef.current = isAlerting;

  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(getDuration(phase));
    }
  }, [focusMinutes, breakMinutes, phase, isRunning, getDuration]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
  }, []);

  const clearBeepLoop = useCallback(() => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    if (beepTimeoutRef.current) {
      clearTimeout(beepTimeoutRef.current);
      beepTimeoutRef.current = null;
    }
    setIsAlerting(false);
  }, []);

  const startBeepLoop = useCallback(
    (mode: AlertMode) => {
      clearBeepLoop();
      setIsAlerting(true);
      playNotificationSound();
      beepIntervalRef.current = setInterval(
        playNotificationSound,
        BREAK_BEEP_INTERVAL_MS,
      );
      if (mode === 'timed') {
        beepTimeoutRef.current = setTimeout(
          clearBeepLoop,
          TIMED_ALERT_DURATION_MS,
        );
      }
    },
    [clearBeepLoop],
  );

  const switchPhase = useCallback(
    (autoTransition = false) => {
      const currentPhase = phaseRef.current;
      const nextPhase: PomodoroPhase =
        currentPhase === 'task' ? 'break' : 'task';
      if (currentPhase === 'task') {
        setCompletedCount(prev => prev + 1);
      }
      if (autoTransition && !isAlertingRef.current) {
        startBeepLoop(alertModeRef.current);
      }
      setPhase(nextPhase);
      const duration = getDuration(nextPhase);
      setSecondsLeft(duration);
      endTimeRef.current = Date.now() + duration * 1000;
    },
    [startBeepLoop, getDuration],
  );

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
    }

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((endTimeRef.current! - Date.now()) / 1000);
      if (remaining <= 0) {
        switchPhase(true);
      } else {
        setSecondsLeft(remaining);
      }
    }, TICK_INTERVAL_MS);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, clearTimer, switchPhase]);

  useEffect(() => {
    return clearBeepLoop;
  }, [clearBeepLoop]);

  const handleReset = useCallback(() => {
    clearTimer();
    clearBeepLoop();
    setIsRunning(false);
    setPhase(prev => {
      setSecondsLeft(getDuration(prev));
      return prev;
    });
  }, [clearTimer, clearBeepLoop, getDuration]);

  const handleSkip = useCallback(() => {
    clearBeepLoop();
    setPhase(prev => {
      const nextPhase: PomodoroPhase = prev === 'task' ? 'break' : 'task';
      if (prev === 'task') {
        setCompletedCount(c => c + 1);
      }
      const duration = getDuration(nextPhase);
      setSecondsLeft(duration);
      if (isRunning) {
        endTimeRef.current = Date.now() + duration * 1000;
      }
      return nextPhase;
    });
  }, [clearBeepLoop, isRunning, getDuration]);

  const handleToggleRunning = useCallback(() => {
    setIsRunning(prev => {
      if (prev) clearBeepLoop();
      return !prev;
    });
  }, [clearBeepLoop]);

  const setFocusMinutes = useCallback((minutes: number) => {
    setFocusMinutesState(Math.max(1, minutes));
  }, []);

  const setBreakMinutes = useCallback((minutes: number) => {
    setBreakMinutesState(Math.max(1, minutes));
  }, []);

  return {
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
  };
};
