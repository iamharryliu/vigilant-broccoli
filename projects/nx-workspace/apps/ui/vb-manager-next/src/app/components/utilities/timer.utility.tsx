'use client';

import { Flex, Text, Button } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

export const TimerUtilityContent = () => {
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');
  const [timerRepeat, setTimerRepeat] = useState('');
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [totalRepetitions, setTotalRepetitions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 100) {
            playNotificationSound();

            if (currentRepetition < totalRepetitions) {
              setCurrentRepetition(currentRepetition + 1);
              return timerDuration;
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
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTimerTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    </>
  );
};
