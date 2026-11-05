export interface ScrapedEvent {
  id: string;
  title: string;
  // Facebook's display text ("Sat, Nov 14 at 8:00 AM"); parsed by
  // google-calendar.sync. Sources that already know the exact time set
  // start/end instead.
  dateTime?: string;
  // Local wall-clock time in the calendar's time zone ("2026-11-14T08:00:00"),
  // or a date ("2026-11-14") when allDay. end is exclusive for all-day events.
  start?: string;
  end?: string;
  allDay?: boolean;
  // Ids from non-Facebook sources are hashed, so the calendar event id gets a
  // different prefix than Facebook's.
  external?: boolean;
  location?: string;
  description?: string;
  sharedBy?: string;
  section: string;
  url: string;
}
