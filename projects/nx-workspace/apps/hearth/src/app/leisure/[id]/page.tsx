'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { LeisureActivity } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

const CATEGORY_COLORS: Record<string, string> = {
  Movies: 'blue',
  Shows: 'purple',
  Crafts: 'orange',
  Games: 'green',
  Outdoors: 'teal',
  Music: 'pink',
  Books: 'yellow',
  Other: 'gray',
};

export default function LeisureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [activity, setActivity] = useState<LeisureActivity | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/leisure?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setActivity);
  }, [id, session?.access_token]);

  if (!activity) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link
        href={ROUTES.LEISURE}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <Text size="6" weight="bold">
          {activity.title}
        </Text>
        <Badge
          color={CATEGORY_COLORS[activity.category] as never}
          variant="soft"
          size="2"
        >
          {activity.category}
        </Badge>
      </div>

      {activity.description && (
        <Text size="3" color="gray" as="p">
          {activity.description}
        </Text>
      )}

      {activity.createdByEmail && (
        <Text size="2" color="gray" as="p">
          Added by {activity.createdByEmail}
        </Text>
      )}

      <Text size="1" color="gray" as="p">
        Added{' '}
        {new Date(activity.createdAt).toLocaleDateString(undefined, {
          dateStyle: 'medium',
        })}
      </Text>
    </div>
  );
}
