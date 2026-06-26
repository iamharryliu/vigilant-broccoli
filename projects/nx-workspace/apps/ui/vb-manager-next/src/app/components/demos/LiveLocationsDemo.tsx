'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, useGeolocation } from '@vigilant-broccoli/react-lib';
import { useLiveLocations } from '../../hooks/useLiveLocations';

const LiveUserMap = dynamic(
  () => import('./LiveUserMap').then(m => m.LiveUserMap),
  { ssr: false },
);

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const USER_PREFIX = 'user-';
const USER_ID_LENGTH = 6;
const NO_SUPABASE_MSG =
  'Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL missing).';
const NO_LOCATION_MSG = 'Waiting for location permission…';
const WINDOW_TARGET_BLANK = '_blank';
const YOU_LABEL = 'You';
const SHARE_LABEL = 'Share my location';
const STOP_SHARING_LABEL = 'Stop sharing';
const VIEW_ON_GOOGLE_MAPS_LABEL = 'View on Google Maps';
const NO_LIVE_USERS_MSG =
  'No live users yet. Open this page in another browser and share location.';

const randomUserId = () =>
  `${USER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + USER_ID_LENGTH)}`;

export function LiveLocationsDemo() {
  const [userId, setUserId] = useState('');
  useEffect(() => {
    setUserId(randomUserId());
  }, []);
  const [sharing, setSharing] = useState(false);
  const { lat, lng, error: geoError } = useGeolocation();
  const liveUsers = useLiveLocations(
    userId,
    sharing ? lat : null,
    sharing ? lng : null,
  );

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasLocation = lat !== null && lng !== null;

  const usersToShow = useMemo(
    () => (sharing ? liveUsers : liveUsers.filter(u => u.userId !== userId)),
    [liveUsers, sharing, userId],
  );

  if (!hasSupabase) {
    return <p className="text-sm text-gray-500">{NO_SUPABASE_MSG}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600">
          You: <strong>{userId}</strong>
        </span>
        {geoError && <span className="text-sm text-red-500">{geoError}</span>}
        {!geoError && !hasLocation && (
          <span className="text-sm text-gray-400">{NO_LOCATION_MSG}</span>
        )}
        <Button
          variant={sharing ? 'destructive' : 'default'}
          disabled={!hasLocation}
          onClick={() => setSharing(s => !s)}
        >
          {sharing ? STOP_SHARING_LABEL : SHARE_LABEL}
        </Button>
      </div>

      {usersToShow.length > 0 && (
        <LiveUserMap users={usersToShow} currentUserId={userId} />
      )}

      <div className="flex flex-col gap-2">
        {usersToShow.length === 0 ? (
          <p className="text-sm text-gray-400">{NO_LIVE_USERS_MSG}</p>
        ) : (
          usersToShow.map(user => (
            <div
              key={user.userId}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {user.userId === userId ? YOU_LABEL : user.userId}
              </span>
              <span className="text-gray-500">
                {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
              </span>
              <a
                href={`${GOOGLE_MAPS_BASE}${user.lat},${user.lng}`}
                target={WINDOW_TARGET_BLANK}
                rel="noreferrer"
              >
                <Button variant="secondary" size="sm">
                  {VIEW_ON_GOOGLE_MAPS_LABEL}
                </Button>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
