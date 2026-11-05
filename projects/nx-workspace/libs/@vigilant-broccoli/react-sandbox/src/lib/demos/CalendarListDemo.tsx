import {
  CalendarEventInput,
  CalendarListSkeleton,
  CalendarListView,
} from '@vigilant-broccoli/react-lib-calendar';
import { useState } from 'react';
import { DemoSection } from './DemoSection';

const SAMPLE_EVENT_COUNT = 6;
const EVENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const EVENT_TITLES = [
  'Team standup',
  'Dentist appointment',
  'Lunch with Sam',
  'Release review',
  'Yoga class',
  'Book club',
];

const buildSampleEvents = (): CalendarEventInput[] => {
  const now = new Date();
  return Array.from({ length: SAMPLE_EVENT_COUNT }, (_, index) => {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + Math.floor(index / 2),
      9 + index * 2,
    );
    return {
      id: `sample-${index}`,
      title: EVENT_TITLES[index],
      start,
      end: new Date(start.getTime() + 60 * 60 * 1000),
      allDay: index === 3,
      color: EVENT_COLORS[index % EVENT_COLORS.length],
    };
  });
};

export const CalendarListDemo = () => {
  const [events] = useState(buildSampleEvents);
  const [clickedId, setClickedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <DemoSection title="Calendar List View">
        <CalendarListView events={events} onEventClick={setClickedId} />
        <p className="text-sm text-muted-foreground">
          {clickedId ? `Clicked ${clickedId}` : 'Click an event'}
        </p>
      </DemoSection>
      <DemoSection title="Loading">
        <CalendarListView events={[]} loading />
      </DemoSection>
      <DemoSection title="Calendar List Skeleton">
        <CalendarListSkeleton />
      </DemoSection>
    </div>
  );
};
