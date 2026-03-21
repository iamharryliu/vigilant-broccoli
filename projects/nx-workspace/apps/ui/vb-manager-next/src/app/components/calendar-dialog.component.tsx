'use client';

import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { useAppMode, APP_MODE } from '../app-mode-context';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';

const BIRTHDAYS_CALENDAR =
  'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com';

const CALENDAR_CONFIG: Record<'personal' | 'work', CalendarConfig> = {
  personal: {
    height: 600,
    wkst: 2,
    ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
    showPrint: 0,
    mode: 'AGENDA',
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
    ],
  },
  work: {
    height: 600,
    wkst: 2,
    ctz: GOOGLE_CALENDAR.TIMEZONE.STOCKHOLM,
    showPrint: 0,
    mode: 'AGENDA',
    ownerCalendars: [
      {
        email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.LIGHT_BLUE,
      },
    ],
    sharedCalendars: [
      {
        id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_GREEN,
      },
      {
        id: BIRTHDAYS_CALENDAR,
        color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
      },
    ],
  },
};

interface CalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarDialog = ({ open, onOpenChange }: CalendarDialogProps) => {
  const { appMode } = useAppMode();
  const config = appMode === APP_MODE.PERSONAL ? CALENDAR_CONFIG.personal : CALENDAR_CONFIG.work;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '90vw', width: '90vw', height: '90vh', padding: 0, overflow: 'hidden' }}>
        <VisuallyHidden><Dialog.Title>Calendar</Dialog.Title></VisuallyHidden>
        <iframe
          tabIndex={-1}
          src={buildCalendarUrl(config)}
          className="dark:invert dark:hue-rotate-180"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};
