'use client';

import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { DATE_CONST, getISOWeekNumber } from '@vigilant-broccoli/common-js';

export const ClockComponent = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');
  const [timerRepeat, setTimerRepeat] = useState('');
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [totalRepetitions, setTotalRepetitions] = useState(0);

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      setCurrentDate(`${year}-${month}-${day}`);

      // Get day of week
      const days = DATE_CONST.DAY
      setDayOfWeek(days[now.getDay()]);

      // Calculate ISO week number
      const weekNo = getISOWeekNumber(now);
      setWeekNumber(weekNo.toString());

      // Get timezone information
      const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;
      const offsetSign = offsetMinutes >= 0 ? '+' : '-';
      const offsetString = offsetMins > 0
        ? `UTC${offsetSign}${offsetHours}:${offsetMins.toString().padStart(2, '0')}`
        : `UTC${offsetSign}${offsetHours}`;
      setTimezone(`${timezoneName} (${offsetString})`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stopwatch logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 100) {
            // Play notification sound when timer completes
            playNotificationSound();

            // Check if there are more repetitions
            if (currentRepetition < totalRepetitions) {
              setCurrentRepetition(currentRepetition + 1);
              return timerDuration; // Restart with the original duration
            } else {
              setTimerRunning(false);
              return 0;
            }
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining, currentRepetition, totalRepetitions, timerDuration]);

  const playNotificationSound = () => {
    // Create an AudioContext
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the beep
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Play for 500ms
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatStopwatchTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatTimerTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatchToggle = () => {
    setStopwatchRunning(!stopwatchRunning);
  };

  const handleStopwatchReset = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const handleTimerStart = () => {
    const minutes = parseInt(timerMinutes) || 0;
    const seconds = parseInt(timerSeconds) || 0;
    const totalMs = (minutes * 60 + seconds) * 1000;
    const repetitions = parseInt(timerRepeat) || 1;

    if (totalMs > 0) {
      setTimerDuration(totalMs);
      setTimerRemaining(totalMs);
      setTotalRepetitions(repetitions);
      setCurrentRepetition(1);
      setTimerRunning(true);
    }
  };

  const handleTimerStop = () => {
    setTimerRunning(false);
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
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        {/* Clock Display */}
        <Flex direction="column" align="center" gap="1">
          <Text size="8" weight="bold" className="font-mono">
            {currentTime}
          </Text>
          <Text size="2" color="gray" className="font-mono">
            Week {weekNumber}, {dayOfWeek}, {currentDate}
          </Text>
          <Text size="1" color="gray">
            {timezone}
          </Text>
        </Flex>

        {/* Stopwatch Section */}
        <Collapsible.Root
          open={isStopwatchOpen}
          onOpenChange={setIsStopwatchOpen}
          className="border-t border-gray-300 dark:border-gray-700 pt-3"
        >
          <Collapsible.Trigger asChild>
            <button
              className="flex items-center justify-between w-full mb-3 group cursor-pointer"
              aria-label={isStopwatchOpen ? 'Collapse' : 'Expand'}
            >
              <Text size="3" weight="bold">
                Stopwatch
              </Text>
              <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
                {isStopwatchOpen ? '▲' : '▼'}
              </Text>
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content className="flex flex-col gap-3">
            <Flex align="center" justify="between" gap="3">
              <Flex gap="2">
                <Button
                  size="2"
                  variant="soft"
                  onClick={handleStopwatchToggle}
                >
                  {stopwatchRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  size="2"
                  variant="outline"
                  onClick={handleStopwatchReset}
                >
                  Reset
                </Button>
              </Flex>
              <Text size="6" weight="bold" className="font-mono">
                {formatStopwatchTime(stopwatchTime)}
              </Text>
            </Flex>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Timer Section */}
        <Collapsible.Root
          open={isTimerOpen}
          onOpenChange={setIsTimerOpen}
          className="border-t border-gray-300 dark:border-gray-700 pt-3"
        >
          <Collapsible.Trigger asChild>
            <button
              className="flex items-center justify-between w-full mb-3 group cursor-pointer"
              aria-label={isTimerOpen ? 'Collapse' : 'Expand'}
            >
              <Text size="3" weight="bold">
                Timer
              </Text>
              <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
                {isTimerOpen ? '▲' : '▼'}
              </Text>
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content className="flex flex-col gap-3">
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
                  <Button
                    size="2"
                    variant="outline"
                    onClick={handleTimerReset}
                  >
                    Reset
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Flex direction="column" gap="2">
                <Flex gap="2" align="end">
                  <Flex direction="column" gap="1" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <Text size="1" color="gray">Minutes</Text>
                    <input
                      type="number"
                      min="0"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(e.target.value)}
                      placeholder="0"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
                    />
                  </Flex>
                  <Flex direction="column" gap="1" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <Text size="1" color="gray">Seconds</Text>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(e.target.value)}
                      placeholder="0"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
                    />
                  </Flex>
                  <Flex direction="column" gap="1" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <Text size="1" color="gray">Repeat</Text>
                    <input
                      type="number"
                      min="1"
                      value={timerRepeat}
                      onChange={(e) => setTimerRepeat(e.target.value)}
                      placeholder="1"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent w-full"
                    />
                  </Flex>
                </Flex>
                <Button
                  size="2"
                  variant="soft"
                  onClick={handleTimerStart}
                >
                  Start Timer
                </Button>
              </Flex>
            )}
          </Collapsible.Content>
        </Collapsible.Root>
      </Flex>
    </Card>
  );
};
