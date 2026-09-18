'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import {
  Text,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
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

type ModalState =
  | { type: 'create'; start: string; end: string; allDay: boolean }
  | { type: 'edit'; event: CalendarEvent }
  | null;

const EVENTS_ENDPOINT = '/api/calendar/events';
const JSON_CONTENT_TYPE_HEADER = { 'Content-Type': 'application/json' };

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
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  const fetchEvents = useCallback(async () => {
    if (!token || !range) return;
    const params = new URLSearchParams({
      start: range.start,
      end: range.end,
    });
    const res = await fetch(`${EVENTS_ENDPOINT}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  }, [token, range]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (data: CalendarEventFormData) => {
    await fetch(EVENTS_ENDPOINT, {
      method: 'POST',
      headers: authHeader(JSON_CONTENT_TYPE_HEADER),
      body: JSON.stringify(data),
    });
    setModal(null);
    fetchEvents();
  };

  const handleEdit = async (data: CalendarEventFormData) => {
    if (modal?.type !== 'edit') return;
    await fetch(EVENTS_ENDPOINT, {
      method: 'PATCH',
      headers: authHeader(JSON_CONTENT_TYPE_HEADER),
      body: JSON.stringify({ id: modal.event.id, ...data }),
    });
    setModal(null);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (modal?.type !== 'edit') return;
    await fetch(EVENTS_ENDPOINT, {
      method: 'DELETE',
      headers: authHeader(JSON_CONTENT_TYPE_HEADER),
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
      headers: authHeader(JSON_CONTENT_TYPE_HEADER),
      body: JSON.stringify({ id: evId, start, end, allDay }),
    });
    fetchEvents();
  };

  return (
    <div className="p-4 sm:p-6 md:px-8 md:py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-[calc(100dvh_-_var(--topbar-h)_-_5rem)]">
          {homeId && session?.user.id && (
            <WhiteboardEditor
              homeId={homeId}
              token={token}
              userId={session.user.id}
              username={session.user.email ?? session.user.id}
              style={{ height: '100%' }}
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

      <Dialog.Root
        open={modal !== null}
        onOpenChange={open => {
          if (!open) setModal(null);
        }}
      >
        <Dialog.Content
          className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
          style={{ maxWidth: 480 }}
        >
          <Dialog.Title>
            {modal?.type === 'edit' ? 'Edit Event' : 'New Event'}
          </Dialog.Title>

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
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
