'use client';

import { Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { DATE_CONST, getISOWeekNumber } from '@vigilant-broccoli/common-js';

interface ClockBlockProps {
  type: 'time' | 'info';
}

export const ClockComponent = ({ type = 'time' }: ClockBlockProps) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [timezone, setTimezone] = useState('');

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

      const days = DATE_CONST.DAY
      setDayOfWeek(days[now.getDay()]);

      const weekNo = getISOWeekNumber(now);
      setWeekNumber(weekNo.toString());

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

  if (type === 'time') {
    return (
      <Text size="8" weight="bold" className="font-mono">
        {currentTime}
      </Text>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'center' }}>
      <Text size="2" color="gray" className="font-mono">
        Week {weekNumber}, {dayOfWeek}, {currentDate}
      </Text>
      <Text size="1" color="gray">
        {timezone}
      </Text>
    </div>
  );
};
