'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
  EventReceiveArg,
} from '@fullcalendar/core';
import { CalendarEvent } from '../../../lib/types';

interface Props {
  events: CalendarEvent[];
  onSelectSlot: (start: string, end: string, allDay: boolean) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (
    id: string,
    start: string,
    end: string,
    allDay: boolean,
  ) => void;
  onEventReceive?: (arg: EventReceiveArg) => void;
  droppable?: boolean;
  showViewSwitcher?: boolean;
  height?: string;
}

const toFullCalendarEvent = (e: CalendarEvent): EventInput => ({
  id: e.id,
  title: e.title,
  start: e.start,
  end: e.end,
  allDay: e.allDay,
  backgroundColor: e.color ?? undefined,
  borderColor: e.color ?? undefined,
});

export function CalendarView({
  events,
  onSelectSlot,
  onEventClick,
  onEventDrop,
  onEventReceive,
  droppable = false,
  showViewSwitcher = true,
  height = '75vh',
}: Props) {
  const handleSelect = (arg: DateSelectArg) => {
    onSelectSlot(arg.startStr, arg.endStr, arg.allDay);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const ev = events.find(e => e.id === arg.event.id);
    if (ev) onEventClick(ev);
  };

  const handleEventDrop = (arg: EventDropArg) => {
    onEventDrop(
      arg.event.id,
      arg.event.startStr,
      arg.event.endStr ?? arg.event.startStr,
      arg.event.allDay,
    );
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: showViewSwitcher
          ? 'dayGridMonth,timeGridWeek,timeGridDay'
          : 'dayGridMonth',
      }}
      height={height}
      selectable
      selectMirror
      editable
      droppable={droppable}
      dayMaxEvents
      events={events.map(toFullCalendarEvent)}
      select={handleSelect}
      eventClick={handleEventClick}
      eventDrop={handleEventDrop}
      eventReceive={onEventReceive}
    />
  );
}
