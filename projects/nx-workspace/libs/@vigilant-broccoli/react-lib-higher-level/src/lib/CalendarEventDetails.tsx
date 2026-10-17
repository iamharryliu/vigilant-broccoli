'use client';

import { Fragment, type ReactNode, useState } from 'react';
import {
  AlignLeft,
  Clock,
  ExternalLink,
  MapPin,
  Repeat,
  Users,
  Video,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import {
  CALENDAR_EVENT_FALLBACK_COLOR,
  type CalendarEvent,
  type CalendarEventAttendee,
  type CalendarEventPerson,
} from './CalendarAgenda';

const ALL_DAY_LABEL = 'All day';
const REPEATING_LABEL = 'Repeating event';
const JOIN_LABEL = 'Join video call';
const OPEN_IN_GOOGLE_CALENDAR_LABEL = 'Open in Google Calendar';
const CLOSE_LABEL = 'Close';
const ORGANIZER_LABEL = 'Organizer';
const SELF_SUFFIX = ' (you)';
const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1';
const ICON_SIZE = 18;

const RESPONSE_STATUS_LABEL: Record<string, string> = {
  accepted: 'Going',
  declined: 'Declined',
  needsAction: 'Awaiting reply',
  tentative: 'Maybe',
};

// Bottom sheet below Tailwind's sm breakpoint, the default centered dialog
// from sm up.
const SHEET_CLASS =
  'flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 max-sm:!bottom-0 max-sm:!top-auto max-sm:!max-w-none max-sm:!translate-y-0 max-sm:rounded-t-2xl sm:w-[calc(100%-2rem)] sm:max-w-[480px]';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /(https?:\/\/[^\s<>"()]+[^\s<>"().,;:!?\]'])/g;
const NON_TEXT_SELECTOR = 'script, style';
const LINE_BREAK_SELECTOR = 'br, p, div, li, h1, h2, h3, h4, h5, h6';
const EXTRA_BLANK_LINES_PATTERN = /\n{3,}/g;

// All-day events carry a bare date, which Date would parse as UTC midnight.
const parseEventDate = (value: string) => {
  if (!DATE_ONLY_PATTERN.test(value)) return new Date(value);
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const formatEventWhen = (event: CalendarEvent) => {
  const start = parseEventDate(event.start);
  const end = parseEventDate(event.end);
  if (event.allDay) {
    // Google's all-day end date is exclusive.
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    return isSameDay(start, lastDay) || lastDay < start
      ? `${formatDate(start)} · ${ALL_DAY_LABEL}`
      : `${formatDate(start)} – ${formatDate(lastDay)} · ${ALL_DAY_LABEL}`;
  }
  return isSameDay(start, end)
    ? `${formatDate(start)} · ${formatTime(start)} – ${formatTime(end)}`
    : `${formatDate(start)}, ${formatTime(start)} – ${formatDate(end)}, ${formatTime(end)}`;
};

// Google stores descriptions as HTML; DOMParser documents are inert (no
// scripts or resource loads), so reading textContent never renders markup.
// Anchors keep their target as text so it is linkified below.
const descriptionToText = (description: string) => {
  const { body } = new DOMParser().parseFromString(description, 'text/html');
  body.querySelectorAll(NON_TEXT_SELECTOR).forEach(element => element.remove());
  body.querySelectorAll('a[href]').forEach(anchor => {
    const href = anchor.getAttribute('href') ?? '';
    const text = anchor.textContent?.trim() ?? '';
    anchor.replaceWith(!text || text === href ? href : `${text} (${href})`);
  });
  body
    .querySelectorAll(LINE_BREAK_SELECTOR)
    .forEach(element => element.after('\n'));
  return (body.textContent ?? '')
    .replace(EXTRA_BLANK_LINES_PATTERN, '\n\n')
    .trim();
};

const LinkifiedText = ({ text }: { text: string }) => (
  <>
    {text.split(URL_PATTERN).map((part, index) =>
      // split with a capture group puts the matched URLs at odd indexes.
      index % 2 === 1 ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          {part}
        </a>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )}
  </>
);

const personName = (person: CalendarEventPerson) =>
  person.displayName ?? person.email ?? '';

const isSamePerson = (a: CalendarEventPerson, b: CalendarEventPerson) =>
  !!a.email && a.email === b.email;

const attendeeDetail = (attendee: CalendarEventAttendee) =>
  [
    attendee.organizer && ORGANIZER_LABEL,
    attendee.responseStatus && RESPONSE_STATUS_LABEL[attendee.responseStatus],
  ]
    .filter(Boolean)
    .join(' · ');

const DetailRow = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex gap-3 px-4 py-3 text-sm text-gray-700 sm:px-6">
    <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

const AttendeeList = ({
  attendees,
  organizer,
}: {
  attendees: CalendarEventAttendee[];
  organizer?: CalendarEventPerson;
}) => {
  const listsOrganizer = attendees.some(
    attendee =>
      attendee.organizer || (organizer && isSamePerson(attendee, organizer)),
  );
  return (
    <ul className="flex flex-col gap-2">
      {organizer && !listsOrganizer && (
        <li className="flex flex-col">
          <span className="truncate text-gray-900">
            {personName(organizer)}
          </span>
          <span className="text-xs text-gray-500">{ORGANIZER_LABEL}</span>
        </li>
      )}
      {attendees.map((attendee, index) => (
        <li key={attendee.email ?? index} className="flex flex-col">
          <span className="truncate text-gray-900">
            {personName(attendee)}
            {attendee.self && SELF_SUFFIX}
          </span>
          {attendeeDetail(attendee) && (
            <span className="text-xs text-gray-500">
              {attendeeDetail(attendee)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

const SheetHeader = ({
  event,
  calendarName,
  calendarColor,
  onClose,
}: {
  event: CalendarEvent;
  calendarName?: string;
  calendarColor: string;
  onClose: () => void;
}) => (
  <div className="flex shrink-0 items-start gap-3 border-b border-gray-200 px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
    <div className="min-w-0 flex-1">
      {calendarName && (
        <p className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-500">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: calendarColor }}
          />
          <span className="truncate">{calendarName}</span>
        </p>
      )}
      <DialogTitle className="break-words text-xl font-bold leading-7 tracking-normal">
        {event.summary}
      </DialogTitle>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100"
    >
      {CLOSE_LABEL}
    </button>
  </div>
);

// Without the footer, the body pads itself for the bottom safe-area inset.
const SheetBody = ({ event }: { event: CalendarEvent }) => {
  const description = event.description
    ? descriptionToText(event.description)
    : '';
  return (
    <div
      className={`min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 ${event.htmlLink ? '' : 'pb-[env(safe-area-inset-bottom)]'}`}
    >
      <DetailRow icon={<Clock size={ICON_SIZE} />}>
        <p>{formatEventWhen(event)}</p>
        {event.recurringEventId && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <Repeat size={12} />
            {REPEATING_LABEL}
          </p>
        )}
      </DetailRow>

      {event.hangoutLink && (
        <DetailRow icon={<Video size={ICON_SIZE} />}>
          <a
            href={event.hangoutLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg bg-blue-500 px-3 py-1.5 font-medium text-white hover:bg-blue-600 active:bg-blue-700"
          >
            {JOIN_LABEL}
          </a>
        </DetailRow>
      )}

      {event.location && (
        <DetailRow icon={<MapPin size={ICON_SIZE} />}>
          <a
            href={`${GOOGLE_MAPS_SEARCH_URL}&query=${encodeURIComponent(event.location)}`}
            target="_blank"
            rel="noreferrer"
            className="break-words text-blue-600 underline"
          >
            {event.location}
          </a>
        </DetailRow>
      )}

      {!!event.attendees?.length && (
        <DetailRow icon={<Users size={ICON_SIZE} />}>
          <AttendeeList
            attendees={event.attendees}
            organizer={event.organizer}
          />
        </DetailRow>
      )}

      {description && (
        <DetailRow icon={<AlignLeft size={ICON_SIZE} />}>
          <p className="whitespace-pre-line break-words">
            <LinkifiedText text={description} />
          </p>
        </DetailRow>
      )}
    </div>
  );
};

const SheetFooter = ({ htmlLink }: { htmlLink: string }) => (
  <div className="shrink-0 border-t border-gray-200 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-6 sm:pb-6">
    <a
      href={htmlLink}
      target="_blank"
      rel="noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
    >
      <ExternalLink size={16} />
      {OPEN_IN_GOOGLE_CALENDAR_LABEL}
    </a>
  </div>
);

interface CalendarEventDetailsProps {
  // null closes the sheet.
  event: CalendarEvent | null;
  colorByCalendarId: Map<string, string>;
  nameByCalendarId: Map<string, string>;
  onClose: () => void;
}

export const CalendarEventDetails = ({
  event,
  colorByCalendarId,
  nameByCalendarId,
  onClose,
}: CalendarEventDetailsProps) => {
  // Keeps the last event rendered while the sheet animates closed.
  const [shown, setShown] = useState(event);
  if (event && event !== shown) setShown(event);

  return (
    <Dialog open={event !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className={SHEET_CLASS}
        aria-describedby={undefined}
        showCloseButton={false}
      >
        {shown && (
          <>
            <SheetHeader
              event={shown}
              calendarName={nameByCalendarId.get(shown.calendarId)}
              calendarColor={
                colorByCalendarId.get(shown.calendarId) ??
                CALENDAR_EVENT_FALLBACK_COLOR
              }
              onClose={onClose}
            />
            <SheetBody event={shown} />
            {shown.htmlLink && <SheetFooter htmlLink={shown.htmlLink} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
