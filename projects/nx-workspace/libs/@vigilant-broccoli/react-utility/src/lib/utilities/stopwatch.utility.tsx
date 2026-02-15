'use client';

import { Flex, Text, Button, ScrollArea } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

interface Lap {
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

export const StopwatchUtilityContent = () => {
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lastLapTime, setLastLapTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  const formatStopwatchTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatchToggle = () => {
    setStopwatchRunning(!stopwatchRunning);
  };

  const handleLap = () => {
    const lapTime = stopwatchTime - lastLapTime;
    const newLap: Lap = {
      lapNumber: laps.length + 1,
      lapTime,
      totalTime: stopwatchTime,
    };
    setLaps([newLap, ...laps]);
    setLastLapTime(stopwatchTime);
  };

  const handleStopwatchReset = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
    setLastLapTime(0);
  };

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" justify="between" gap="3">
        <Flex gap="2">
          <Button size="2" variant="soft" onClick={handleStopwatchToggle}>
            {stopwatchRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            size="2"
            variant="outline"
            onClick={handleLap}
            disabled={stopwatchTime === 0}
          >
            Lap
          </Button>
          <Button size="2" variant="outline" onClick={handleStopwatchReset}>
            Reset
          </Button>
        </Flex>
        <Text size="6" weight="bold" className="font-mono">
          {formatStopwatchTime(stopwatchTime)}
        </Text>
      </Flex>

      {laps.length > 0 && (
        <Flex direction="column" gap="2">
          <Text size="2" weight="bold" color="gray">
            Laps
          </Text>
          <ScrollArea style={{ maxHeight: '200px' }}>
            <Flex direction="column" gap="1">
              {laps.map(lap => (
                <Flex
                  key={lap.lapNumber}
                  justify="between"
                  align="center"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                >
                  <Text size="2" weight="medium">
                    Lap {lap.lapNumber}
                  </Text>
                  <Flex gap="4">
                    <Text size="2" className="font-mono" color="gray">
                      +{formatStopwatchTime(lap.lapTime)}
                    </Text>
                    <Text size="2" className="font-mono" weight="medium">
                      {formatStopwatchTime(lap.totalTime)}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </ScrollArea>
        </Flex>
      )}
    </Flex>
  );
};
