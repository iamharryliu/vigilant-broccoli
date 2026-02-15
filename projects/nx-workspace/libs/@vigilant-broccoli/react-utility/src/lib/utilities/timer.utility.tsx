'use client';

import { Flex, Text, Button } from '@radix-ui/themes';
import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'vb-manager-timer-state';

interface TimerState {
  endTime: number;
  duration: number;
  currentRepetition: number;
  totalRepetitions: number;
  isRunning: boolean;
}

export const TimerUtilityContent = () => {
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');
  const [timerRepeat, setTimerRepeat] = useState('');
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [totalRepetitions, setTotalRepetitions] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const notificationShownRef = useRef(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const state: TimerState = JSON.parse(savedState);
      if (state.isRunning && state.endTime > Date.now()) {
        setEndTime(state.endTime);
        setTimerDuration(state.duration);
        setCurrentRepetition(state.currentRepetition);
        setTotalRepetitions(state.totalRepetitions);
        setTimerRunning(true);
        notificationShownRef.current = false;
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const showNotification = () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification('Timer Complete', {
        body:
          currentRepetition < totalRepetitions
            ? `Repetition ${currentRepetition} of ${totalRepetitions} complete!`
            : 'All repetitions complete!',
        icon: '/favicon.ico',
        tag: 'timer-notification',
        requireInteraction: true,
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && endTime > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
          if (!notificationShownRef.current) {
            playNotificationSound();
            showNotification();
            notificationShownRef.current = true;
          }

          if (currentRepetition < totalRepetitions) {
            const newEndTime = now + timerDuration;
            setEndTime(newEndTime);
            setCurrentRepetition(currentRepetition + 1);
            setTimerRemaining(timerDuration);
            notificationShownRef.current = false;

            saveTimerState({
              endTime: newEndTime,
              duration: timerDuration,
              currentRepetition: currentRepetition + 1,
              totalRepetitions,
              isRunning: true,
            });
          } else {
            setTimerRunning(false);
            setTimerRemaining(0);
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          setTimerRemaining(remaining);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [
    timerRunning,
    endTime,
    currentRepetition,
    totalRepetitions,
    timerDuration,
    showNotification,
  ]);

  const saveTimerState = (state: TimerState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const playNotificationSound = () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const requestNotificationPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const formatTimerTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleTimerStart = () => {
    const minutes = parseInt(timerMinutes) || 0;
    const seconds = parseInt(timerSeconds) || 0;
    const totalMs = (minutes * 60 + seconds) * 1000;
    const repetitions = parseInt(timerRepeat) || 1;

    if (totalMs > 0) {
      requestNotificationPermission();

      const newEndTime = Date.now() + totalMs;
      setTimerDuration(totalMs);
      setTimerRemaining(totalMs);
      setTotalRepetitions(repetitions);
      setCurrentRepetition(1);
      setEndTime(newEndTime);
      setTimerRunning(true);
      notificationShownRef.current = false;

      saveTimerState({
        endTime: newEndTime,
        duration: totalMs,
        currentRepetition: 1,
        totalRepetitions: repetitions,
        isRunning: true,
      });
    }
  };

  const handleTimerStop = () => {
    setTimerRunning(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerRemaining(0);
    setTimerMinutes('');
    setTimerSeconds('');
    setTimerRepeat('');
    setCurrentRepetition(0);
    setTotalRepetitions(0);
    setTimerDuration(0);
    setEndTime(0);
    notificationShownRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {timerRemaining > 0 || currentRepetition > 0 ? (
        <Flex direction="column" align="center" gap="2">
          <Text size="6" weight="bold" className="font-mono">
            {formatTimerTime(timerRemaining)}
          </Text>
          {totalRepetitions > 1 && (
            <Text size="2" color="gray">
              Repetition {currentRepetition} of {totalRepetitions}
            </Text>
          )}
          <Flex gap="2">
            <Button
              size="2"
              variant="soft"
              onClick={handleTimerStop}
              disabled={!timerRunning}
            >
              Stop
            </Button>
            <Button size="2" variant="outline" onClick={handleTimerReset}>
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
          <Button size="2" variant="soft" onClick={handleTimerStart}>
            Start Timer
          </Button>
        </Flex>
      )}
    </>
  );
};
