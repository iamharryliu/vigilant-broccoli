'use client';

import { useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import { CalendarPlus } from 'lucide-react';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import { VisuallyHidden } from '@vigilant-broccoli/react-lib';
import { CalendarInput } from './calendar-input';

const BIRTHDAYS_CALENDAR =
  'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com';
const CALENDAR_TITLE = 'Personal Calendar';

const CALENDAR_CONFIG: CalendarConfig = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  mode: 'AGENDA',
  title: CALENDAR_TITLE,
  ownerCalendars: [
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
    },
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
    },
  ],
  sharedCalendars: [
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
    },
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_PINK,
    },
    {
      id: BIRTHDAYS_CALENDAR,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
    },
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.H_AND_K,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PINK,
    },
  ],
};

export const MyCalendarView = () => {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
      >
        <CalendarPlus size={16} />
        Create Event
      </button>

      <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200">
        <iframe
          src={buildCalendarUrl(CALENDAR_CONFIG)}
          className="h-full w-full dark:invert dark:hue-rotate-180"
          style={{ minHeight: '70vh' }}
          title={CALENDAR_TITLE}
        />
      </div>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Content
          style={{
            maxWidth: '95vw',
            width: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <VisuallyHidden>
            <Dialog.Title>Create Calendar Event</Dialog.Title>
          </VisuallyHidden>
          <CalendarInput />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};
