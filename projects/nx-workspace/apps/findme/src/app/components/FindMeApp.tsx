'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@vigilant-broccoli/react-lib';
import { isSharingUser, useLiveLocations } from '../hooks/useLiveLocations';

const LiveUserMap = dynamic(
  () => import('./LiveUserMap').then(m => m.LiveUserMap),
  { ssr: false },
);

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const USER_PREFIX = 'user-';
const USER_ID_LENGTH = 6;
const WINDOW_TARGET_BLANK = '_blank';
const YOU_LABEL = 'You';
const SHARE_LABEL = 'Share my location';
const STOP_SHARING_LABEL = 'Stop sharing';
const VIEW_ON_GOOGLE_MAPS_LABEL = 'View on Google Maps';
const VIEWING_LABEL = 'Viewing';
const NO_LIVE_USERS_MSG =
  'No one else is here yet. Share this page to invite others.';

const randomUserId = () =>
  `${USER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + USER_ID_LENGTH)}`;

export function FindMeApp() {
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

  const hasLocation = lat !== null && lng !== null;
  const sharingUsers = useMemo(
    () => liveUsers.filter(isSharingUser),
    [liveUsers],
  );

  return (
    <div className="flex flex-col h-screen">
      {sharingUsers.length > 0 && (
        <div className="flex-1">
          <LiveUserMap users={sharingUsers} currentUserId={userId} />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            You: <strong className="text-gray-800">{userId}</strong>
          </span>
          {geoError && <span className="text-sm text-red-500">{geoError}</span>}
          <button
            className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors ${
              sharing
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50`}
            disabled={!hasLocation}
            onClick={() => setSharing(s => !s)}
          >
            {sharing ? STOP_SHARING_LABEL : SHARE_LABEL}
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {liveUsers.length === 0 ? (
            <p className="text-sm text-gray-400">{NO_LIVE_USERS_MSG}</p>
          ) : (
            liveUsers.map(user => {
              const isSelf = user.userId === userId;
              const sharingLocation = isSharingUser(user);
              return (
                <div
                  key={user.userId}
                  className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {isSelf ? YOU_LABEL : user.userId}
                  </span>
                  {sharingLocation ? (
                    <>
                      <span className="text-gray-500">
                        {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
                      </span>
                      <a
                        href={`${GOOGLE_MAPS_BASE}${user.lat},${user.lng}`}
                        target={WINDOW_TARGET_BLANK}
                        rel="noreferrer"
                        className="text-blue-600 text-xs underline"
                      >
                        {VIEW_ON_GOOGLE_MAPS_LABEL}
                      </a>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      {VIEWING_LABEL}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
