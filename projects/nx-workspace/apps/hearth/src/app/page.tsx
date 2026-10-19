'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Text,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from './providers/auth-provider';
import { useHome } from './providers/home-provider';
import { CalendarEvent } from '../lib/types';
import { CalendarView } from './calendar/components/CalendarView';
import {
  CalendarEventForm,
  CalendarEventFormData,
} from './calendar/components/CalendarEventForm';
import { WhiteboardEditor } from './whiteboard/components/WhiteboardEditor';
import { PAGE_TITLES, usePageTitle } from '../lib/page-title';
import { PAGE_BODY_HEIGHT_CLASS, PAGE_PADDING_CLASS } from '../lib/page-layout';
import { useAuthHeader, useJsonAuthHeaders } from './hooks/use-auth-headers';

type ModalState =
  | { type: 'create'; start: string; end: string; allDay: boolean }
  | { type: 'edit'; event: CalendarEvent }
  | null;

const EVENTS_ENDPOINT = '/api/calendar/events';

export default function HomePage() {
  usePageTitle(PAGE_TITLES.HOME);
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [range, setRange] = useState<{ start: string; end: string } | null>(
    null,
  );

  const token = session?.access_token ?? '';
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();

  const fetchEvents = useCallback(async () => {
    if (!token || !range) return;
    const params = new URLSearchParams({
      start: range.start,
      end: range.end,
    });
    const res = await fetch(`${EVENTS_ENDPOINT}?${params}`, {
      headers: await authHeader(),
    });
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  }, [token, range, authHeader]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (data: CalendarEventFormData) => {
    await fetch(EVENTS_ENDPOINT, {
      method: 'POST',
      headers: await jsonHeaders(),
      body: JSON.stringify(data),
    });
    setModal(null);
    fetchEvents();
  };

  const handleEdit = async (data: CalendarEventFormData) => {
    if (modal?.type !== 'edit') return;
    await fetch(EVENTS_ENDPOINT, {
      method: 'PATCH',
      headers: await jsonHeaders(),
      body: JSON.stringify({ id: modal.event.id, ...data }),
    });
    setModal(null);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await fetch(EVENTS_ENDPOINT, {
      method: 'DELETE',
      headers: await jsonHeaders(),
      body: JSON.stringify({ id: modal.event.id }),
    });
    setModal(null);
    fetchEvents();
  };

  const handleEventDrop = async (
    evId: string,
    start: string,
    end: string,
    allDay: boolean,
  ) => {
    await fetch(EVENTS_ENDPOINT, {
      method: 'PATCH',
      headers: await jsonHeaders(),
      body: JSON.stringify({ id: evId, start, end, allDay }),
    });
    fetchEvents();
  };

  return (
    <div className={PAGE_PADDING_CLASS}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className={cn('flex flex-col', PAGE_BODY_HEIGHT_CLASS)}>
          {homeId && session?.user.id && (
            <WhiteboardEditor
              homeId={homeId}
              token={token}
              userId={session.user.id}
              username={session.user.email ?? session.user.id}
            />
          )}
        </div>

        <div>
          <CalendarView
            events={events}
            onSelectSlot={(start, end, allDay) =>
              setModal({ type: 'create', start, end, allDay })
            }
            onEventClick={event => setModal({ type: 'edit', event })}
            onEventDrop={handleEventDrop}
            onRangeChange={(start, end) => setRange({ start, end })}
          />
        </div>
      </div>

      <Dialog
        open={modal !== null}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className={cn(
            'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
            FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
          )}
          style={{ maxWidth: 480 }}
        >
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            {modal?.type === 'edit' ? 'Edit Event' : 'New Event'}
          </DialogTitle>

          {modal?.type === 'create' && (
            <CalendarEventForm
              initialData={{
                start: modal.start,
                end: modal.end,
                allDay: modal.allDay,
              }}
              onSubmit={handleCreate}
              onCancel={() => setModal(null)}
            />
          )}

          {modal?.type === 'edit' && (
            <>
              {modal.event.createdByEmail && (
                <Text size="1" color="gray">
                  Created by {modal.event.createdByEmail}
                </Text>
              )}
              <CalendarEventForm
                initialData={{
                  title: modal.event.title,
                  description: modal.event.description ?? '',
                  start: modal.event.start,
                  end: modal.event.end,
                  allDay: modal.event.allDay,
                  color: modal.event.color ?? '',
                }}
                onSubmit={handleEdit}
                onDelete={handleDelete}
                onCancel={() => setModal(null)}
                isEdit
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
