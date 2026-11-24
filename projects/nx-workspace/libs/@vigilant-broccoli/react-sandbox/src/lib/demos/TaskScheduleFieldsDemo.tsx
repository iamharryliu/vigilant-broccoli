'use client';

import { useState } from 'react';
import {
  ALL_DAYS,
  TaskSchedule,
  TaskScheduleFields,
} from '@vigilant-broccoli/react-lib-tasks';

export const TaskScheduleFieldsDemo = () => {
  const [schedule, setSchedule] = useState<TaskSchedule>({
    days: ALL_DAYS,
    monthlyNth: null,
    monthlyDates: null,
    onceDate: null,
  });
  return (
    <div className="flex max-w-md flex-col gap-3">
      <TaskScheduleFields
        schedule={schedule}
        onChange={update => setSchedule(prev => ({ ...prev, ...update(prev) }))}
      />
    </div>
  );
};
