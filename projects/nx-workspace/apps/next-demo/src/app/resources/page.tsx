'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Text } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { CalendarEvent, Resource, ResourceBooking } from '../../lib/types';
import { CalendarView } from '../calendar/components/CalendarView';
import { ResourceList } from './components/ResourceList';
import { ResourceCalendarDropForm } from './components/ResourceCalendarDropForm';
import {
  ResourceBookingForm,
  ResourceBookingFormData,
} from './components/ResourceBookingForm';
import { ResourceFormData } from './components/ResourceForm';
import { toDateLocal } from '../../lib/date-utils';

type BookingModal =
  | { type: 'create'; startDate: string; endDate: string }
  | { type: 'edit'; booking: ResourceBooking }
  | null;

const bookingToCalendarEvent = (
  b: ResourceBooking,
  resourceName: string,
): CalendarEvent => ({
  id: b.id,
  title: `[${resourceName}] ${b.title}`,
  description: b.description,
  start: b.startDate + 'T00:00:00.000Z',
  end: b.endDate + 'T00:00:00.000Z',
  allDay: true,
  color: null,
  googleEventId: null,
  leisureActivityId: null,
  homeId: b.homeId,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

export default function ResourcesPage() {
  const router = useRouter();
  const session = useAuth();
  const [homeId, setHomeId] = useState<number | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [pendingDrop, setPendingDrop] =
    useState<ResourceBookingFormData | null>(null);
  const [bookingModal, setBookingModal] = useState<BookingModal>(null);

  const token = session?.access_token ?? '';
  const authHeader = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  useEffect(() => {
    supabase
      .from('homes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHomeId(data.id);
      });
  }, [router]);

  const fetchResources = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/resources?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  const fetchBookings = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/resources/bookings?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchResources();
    fetchBookings();
  }, [fetchResources, fetchBookings]);

  const handleAddResource = async (data: ResourceFormData) => {
    await fetch('/api/resources', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    fetchResources();
  };

  const handleEditResource = async (id: string, data: ResourceFormData) => {
    await fetch('/api/resources', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, ...data }),
    });
    fetchResources();
  };

  const handleDeleteResource = async (id: string) => {
    await fetch('/api/resources', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
    });
    await fetchResources();
    fetchBookings();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventReceive = (arg: any) => {
    arg.revert();
    setPendingDrop({
      resourceId: arg.event.extendedProps.resourceId,
      title: arg.event.title,
      description: arg.event.extendedProps.description ?? '',
      startDate: toDateLocal(arg.event.startStr),
      endDate: toDateLocal(arg.event.endStr || arg.event.startStr),
    });
  };

  const handleConfirmDrop = async (data: ResourceBookingFormData) => {
    await fetch('/api/resources/bookings', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    setPendingDrop(null);
    fetchBookings();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventDrop = async (
    id: string,
    start: string,
    end: string,
    _allDay: any,
  ) => {
    await fetch('/api/resources/bookings', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id,
        startDate: toDateLocal(start),
        endDate: toDateLocal(end || start),
      }),
    });
    fetchBookings();
  };

  const handleEventClick = (event: CalendarEvent) => {
    const booking = bookings.find(b => b.id === event.id);
    if (booking) setBookingModal({ type: 'edit', booking });
  };

  const handleSelectSlot = (start: string, end: string) => {
    setBookingModal({
      type: 'create',
      startDate: toDateLocal(start),
      endDate: toDateLocal(end || start),
    });
  };

  const handleBookingCreate = async (data: ResourceBookingFormData) => {
    await fetch('/api/resources/bookings', {
      method: 'POST',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...data, homeId }),
    });
    setBookingModal(null);
    fetchBookings();
  };

  const handleBookingEdit = async (data: ResourceBookingFormData) => {
    if (bookingModal?.type !== 'edit') return;
    await fetch('/api/resources/bookings', {
      method: 'PATCH',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: bookingModal.booking.id, ...data }),
    });
    setBookingModal(null);
    fetchBookings();
  };

  const handleBookingDelete = async () => {
    if (bookingModal?.type !== 'edit') return;
    await fetch('/api/resources/bookings', {
      method: 'DELETE',
      headers: authHeader({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: bookingModal.booking.id }),
    });
    setBookingModal(null);
    fetchBookings();
  };

  const calendarEvents: CalendarEvent[] = bookings.map(b => {
    const resource = resources.find(r => r.id === b.resourceId);
    return bookingToCalendarEvent(b, resource?.name ?? b.resourceId);
  });

  if (!homeId) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Text size="6" weight="bold">
        Resources
      </Text>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <ResourceList
          resources={resources}
          bookings={bookings}
          onAdd={handleAddResource}
          onEdit={handleEditResource}
          onDelete={handleDeleteResource}
        />

        <CalendarView
          events={calendarEvents}
          onSelectSlot={handleSelectSlot}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onEventReceive={handleEventReceive}
          droppable
          showViewSwitcher={false}
          height="70vh"
        />
      </div>

      <Dialog.Root
        open={pendingDrop !== null}
        onOpenChange={open => {
          if (!open) setPendingDrop(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 460 }}>
          <Dialog.Title>Book Resource</Dialog.Title>
          <Text size="2" color="gray" as="p" mb="3">
            Confirm the booking details before adding to the calendar.
          </Text>
          {pendingDrop && (
            <ResourceCalendarDropForm
              initialData={pendingDrop}
              onConfirm={handleConfirmDrop}
              onCancel={() => setPendingDrop(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={bookingModal !== null}
        onOpenChange={open => {
          if (!open) setBookingModal(null);
        }}
      >
        <Dialog.Content style={{ maxWidth: 480 }}>
          <Dialog.Title>
            {bookingModal?.type === 'edit' ? 'Edit Booking' : 'New Booking'}
          </Dialog.Title>

          {bookingModal?.type === 'create' && (
            <ResourceBookingForm
              resources={resources}
              initialData={{
                startDate: bookingModal.startDate,
                endDate: bookingModal.endDate,
              }}
              onSubmit={handleBookingCreate}
              onCancel={() => setBookingModal(null)}
            />
          )}

          {bookingModal?.type === 'edit' && (
            <ResourceBookingForm
              resources={resources}
              initialData={{
                resourceId: bookingModal.booking.resourceId,
                title: bookingModal.booking.title,
                description: bookingModal.booking.description ?? '',
                startDate: bookingModal.booking.startDate,
                endDate: bookingModal.booking.endDate,
              }}
              onSubmit={handleBookingEdit}
              onDelete={handleBookingDelete}
              onCancel={() => setBookingModal(null)}
              isEdit
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
