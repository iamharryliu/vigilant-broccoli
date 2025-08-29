'use client';

import { Heading } from '@radix-ui/themes';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { Button } from '@vigilant-broccoli/react-lib';

type CalendarEvent = {
  summary: string;
  start: string;
  end: string;
};

const start = new Date();
const end = new Date(start);
end.setHours(end.getHours() + 2);

const EVENTS = [
  {
    id: '1',
    title: 'event 1',
    start: start.toISOString(),
    end: end.toISOString(),
    date: start.toISOString().split('T')[0],
    resourceId: 'a',
  },
  {
    id: '2',
    title: 'event 2',
    start: start.toISOString(),
    end: end.toISOString(),
    date: start.toISOString().split('T')[0],
    resourceId: 'd1',
  },
];

const CALENDAR_IFRAME_URL =
  'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FCopenhagen&showPrint=0&mode=AGENDA&showCalendars=0&title&src=ZGI3YzdhYzNlMjk3NDUyNTExOGY5MjQ5NmMwMzk0NjZlNmMzM2E5MjU5M2M3M2IyMGE1ZjY2N2YzMTI2NzI3N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23ef6c00';

export default function Index() {
  const [events, setEvents] = useState(EVENTS);
  const [calendarIframeUrl, setCalendarIframeUrl] =
    useState(CALENDAR_IFRAME_URL);

  async function doggoEvent(type: string) {
    await addCalendarEvent({
      summary: type,
      start: new Date(Date.now()).toISOString(),
      end: new Date(Date.now()).toISOString(),
    });
  }

  async function addCalendarEvent(event: CalendarEvent) {
    await fetch('/api/calendar/event', {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify(event),
    });
    setCalendarIframeUrl(`${CALENDAR_IFRAME_URL}&refresh=${Date.now()}`);

    // setEvents(prev => [
    //   ...prev,
    //   { title: 'New Event', date: new Date().toISOString().split('T')[0] },
    // ]);
  }

  return (
    <>
      <Heading>Calendar Implementation</Heading>
      {/* <Button onClick={addCalendarEvent}>Add Calendar Event</Button> */}
      <Button onClick={() => doggoEvent('Pooed 💩')}>Pooed 💩</Button>
      <Button onClick={() => doggoEvent('Peed 💦')}>Peed 💦</Button>
      <iframe
        src={calendarIframeUrl}
        style={{ border: 'solid 1px #777' }}
        width="800"
        height="600"
      ></iframe>
      <Heading>Calendar Month View</Heading>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
      <Heading>Timeline View</Heading>
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
      />
    </>
  );
}
