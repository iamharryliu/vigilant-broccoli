'use client';

import { useMemo } from 'react';
import { Dialog } from '@radix-ui/themes';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import { VisuallyHidden } from '@vigilant-broccoli/react-lib';

const BIRTHDAYS_CALENDAR =
  'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com';

// Matches the `md` breakpoint used elsewhere in the app (e.g. Sidebar's
// narrow-viewport check) so "mobile" means the same thing everywhere.
const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

const BASE_CALENDAR_CONFIG: Omit<CalendarConfig, 'mode'> = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  title: 'Personal Calendar',
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

interface CalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarDialog = ({ open, onOpenChange }: CalendarDialogProps) => {
  // Recomputed only when the dialog transitions open/closed — not on every
  // resize — so resizing the window while the calendar is open doesn't
  // reload the iframe and lose whatever view the user navigated to.
  const calendarConfig = useMemo<CalendarConfig>(() => {
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
    return { ...BASE_CALENDAR_CONFIG, mode: isMobile ? 'AGENDA' : 'MONTH' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          maxWidth: '90vw',
          width: '90vw',
          height: '90vh',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <VisuallyHidden>
          <Dialog.Title>Calendar</Dialog.Title>
        </VisuallyHidden>
        <iframe
          tabIndex={-1}
          src={buildCalendarUrl(calendarConfig)}
          className="dark:invert dark:hue-rotate-180"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};
