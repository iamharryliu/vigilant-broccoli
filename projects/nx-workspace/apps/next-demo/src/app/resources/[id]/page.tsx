'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Flex, Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { Resource, ResourceBooking } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

const CATEGORY_COLORS: Record<string, string> = {
  Vehicle: 'blue',
  Room: 'green',
  Equipment: 'orange',
  Electronics: 'purple',
  Furniture: 'cyan',
  Tool: 'red',
  Other: 'gray',
};

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);

  useEffect(() => {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    Promise.all([
      fetch(`/api/resources?id=${id}`, { headers }).then(r => r.json()),
      fetch(`/api/resources/bookings?resourceId=${id}`, { headers }).then(r => r.json()),
    ]).then(([res, bkgs]) => {
      setResource(res);
      setBookings(Array.isArray(bkgs) ? bkgs : []);
    });
  }, [id, session?.access_token]);

  if (!resource) return null;

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href={ROUTES.RESOURCES} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <Flex align="center" gap="3" wrap="wrap">
        <Text size="6" weight="bold">{resource.name}</Text>
        <Badge
          color={CATEGORY_COLORS[resource.category] as never}
          variant="soft"
          size="2"
        >
          {resource.category}
        </Badge>
        {resource.quantity > 1 && (
          <Badge variant="outline" size="2">×{resource.quantity}</Badge>
        )}
      </Flex>

      {resource.description && (
        <Text size="3" color="gray" as="p">{resource.description}</Text>
      )}

      {resource.createdByEmail && (
        <Text size="2" color="gray" as="p">Added by {resource.createdByEmail}</Text>
      )}

      {sortedBookings.length > 0 && (
        <div className="space-y-2">
          <Text size="3" weight="medium">Bookings</Text>
          <div className="flex flex-col gap-2">
            {sortedBookings.map(booking => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
              >
                <div>
                  <Text size="2" weight="medium">{booking.title}</Text>
                  {booking.description && (
                    <Text size="1" color="gray" as="p">{booking.description}</Text>
                  )}
                </div>
                <Text size="1" color="gray">
                  {booking.startDate === booking.endDate
                    ? new Date(booking.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
                    : `${new Date(booking.startDate).toLocaleDateString(undefined, { dateStyle: 'short' })} – ${new Date(booking.endDate).toLocaleDateString(undefined, { dateStyle: 'short' })}`}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      <Text size="1" color="gray" as="p">
        Added {new Date(resource.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </Text>
    </div>
  );
}
