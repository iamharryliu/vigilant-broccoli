export type CalendarEventInput = {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date | null;
  allDay?: boolean;
  color?: string | null;
};

export type CalendarDayGroup = {
  key: string;
  date: Date;
  events: CalendarEventInput[];
};
