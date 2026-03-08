'use client';

import { Flex, Heading } from '@radix-ui/themes';
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  date: string;
  resourceId?: string;
};

const start = new Date();
const end = new Date(start);
end.setHours(end.getHours() + 2);

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Meeting with Team',
    start: start.toISOString(),
    end: end.toISOString(),
    date: start.toISOString().split('T')[0],
    resourceId: 'a',
  },
  {
    id: '2',
    title: 'Project Review',
    start: start.toISOString(),
    end: end.toISOString(),
    date: start.toISOString().split('T')[0],
    resourceId: 'd1',
  },
];

export function FullCalendarDemo() {
  const [events] = useState(INITIAL_EVENTS);

  return (
    <Flex direction="column" gap="6" p="4">
      <div>
        <Heading size="5" mb="4">
          Calendar Month View
        </Heading>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      </div>

      <div>
        <Heading size="5" mb="4">
          Timeline View
        </Heading>
        <FullCalendar
          plugins={[resourceTimelinePlugin]}
          initialView="resourceTimeline"
          resources={[
            { id: 'a', title: 'Room A' },
            { id: 'b', title: 'Room B' },
            { id: 'c', title: 'Room C', eventColor: 'green' },
            {
              id: 'd',
              title: 'Building D',
              children: [
                { id: 'd1', title: 'Room D1' },
                { id: 'd2', title: 'Room D2' },
              ],
            },
          ]}
          events={events}
          height="auto"
        />
      </div>
    </Flex>
  );
}
