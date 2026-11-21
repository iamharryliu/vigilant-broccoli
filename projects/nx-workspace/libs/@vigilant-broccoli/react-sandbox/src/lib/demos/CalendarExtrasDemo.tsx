import { useState } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import {
  CalendarEventDetails,
  type CalendarEvent,
  CreateCalendarEventDialog,
} from '@vigilant-broccoli/react-lib-calendar';

const CALENDAR_ID = 'primary';
const HOUR_MS = 60 * 60 * 1000;
const PARSE_PATH = '/api/calendar/parse';

const buildEvent = (): CalendarEvent => {
  const start = new Date(Date.now() + HOUR_MS);
  return {
    id: 'sample-event',
    calendarId: CALENDAR_ID,
    summary: 'Team sync',
    start: start.toISOString(),
    end: new Date(start.getTime() + HOUR_MS).toISOString(),
    allDay: false,
    location: 'Meeting room',
    description: 'Weekly check-in.',
  };
};

export const CalendarEventDetailsDemo = () => {
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  return (
    <>
      <Button variant="outline" onClick={() => setEvent(buildEvent())}>
        Show event details
      </Button>
      <CalendarEventDetails
        event={event}
        colorByCalendarId={new Map([[CALENDAR_ID, '#3b82f6']])}
        nameByCalendarId={new Map([[CALENDAR_ID, 'Personal']])}
        onClose={() => setEvent(null)}
      />
    </>
  );
};

// Stands in for the host app's calendar API: any text parses to one sample
// event, and creating it always succeeds.
const sampleAuthFetch = async (input: RequestInfo | URL) => {
  const { summary, start, end, location, description } = buildEvent();
  const body = String(input).endsWith(PARSE_PATH)
    ? {
        events: [
          {
            summary,
            description: description ?? '',
            location: location ?? '',
            start,
            end,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            allDay: false,
            recurrence: [],
          },
        ],
      }
    : { event: {} };
  return new Response(JSON.stringify(body));
};

export const CreateCalendarEventDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Create calendar event
      </Button>
      <CreateCalendarEventDialog
        open={open}
        onOpenChange={setOpen}
        authFetch={sampleAuthFetch}
      />
    </>
  );
};
