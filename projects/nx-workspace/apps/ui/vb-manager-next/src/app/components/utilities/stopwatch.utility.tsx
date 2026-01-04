'use client';

import { Flex, Text, Button } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';

interface StopwatchUtilityProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const StopwatchUtility = ({ isOpen, setIsOpen }: StopwatchUtilityProps) => {
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  const formatStopwatchTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatchToggle = () => {
    setStopwatchRunning(!stopwatchRunning);
  };

  const handleStopwatchReset = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-gray-300 dark:border-gray-700 pt-3"
    >
      <Collapsible.Trigger asChild>
        <button
          className="flex items-center justify-between w-full mb-3 group cursor-pointer"
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          <Text size="3" weight="bold">
            Stopwatch
          </Text>
          <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
            {isOpen ? '▲' : '▼'}
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
  );
};
