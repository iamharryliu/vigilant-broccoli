'use client';

import { Button, Flex, Heading } from '@radix-ui/themes';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const DOGGO_CALENDAR_ID =
  'db7c7ac3e2974525118f92496c039466e6c33a92593c73b20a5f667f31267277@group.calendar.google.com';

const CALENDAR_IFRAME_URL =
  'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FCopenhagen&showPrint=0&mode=AGENDA&showCalendars=0&title&src=ZGI3YzdhYzNlMjk3NDUyNTExOGY5MjQ5NmMwMzk0NjZlNmMzM2E5MjU5M2M3M2IyMGE1ZjY2N2YzMTI2NzI3N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23ef6c00';

export function CalendarDemo() {
  const { data: session } = useSession();
  const [calendarIframeUrl, setCalendarIframeUrl] =
    useState(CALENDAR_IFRAME_URL);
  const [isCreating, setIsCreating] = useState(false);

  async function doggoEvent(type: string) {
    if (!session) {
      alert('Please sign in to create calendar events');
      return;
    }

    setIsCreating(true);
    try {
      const now = new Date();
      await addCalendarEvent({
        summary: type,
        start: now.toISOString(),
        end: now.toISOString(),
        calendarId: DOGGO_CALENDAR_ID,
      });
      setCalendarIframeUrl(`${CALENDAR_IFRAME_URL}&refresh=${Date.now()}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create calendar event');
    } finally {
      setIsCreating(false);
    }
  }

  async function addCalendarEvent(event: {
    summary: string;
    start: string;
    end: string;
    calendarId?: string;
  }) {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    return response.json();
  }

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading size="5">Doggo Calendar Tracker</Heading>

      {!session && (
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Sign in to create calendar events
        </div>
      )}

      <Flex gap="2">
        <Button
          onClick={() => doggoEvent('Pooed 💩')}
          disabled={!session || isCreating}
        >
          Pooed 💩
        </Button>
        <Button
          onClick={() => doggoEvent('Peed 💦')}
          disabled={!session || isCreating}
        >
          Peed 💦
        </Button>
      </Flex>

      <iframe
        src={calendarIframeUrl}
        style={{ border: 'solid 1px #777' }}
        width="100%"
        height="600"
        title="Google Calendar"
      />
    </Flex>
  );
}
