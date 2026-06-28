'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  CONNECTION_STATUS,
  ConnectionStatus,
  isSharingUser,
  useGeolocation,
  useLiveLocations,
  SupabaseLike,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../../libs/supabase';
import { useTranslation } from '../../i18n';

const LiveUserMap = dynamic(
  () => import('./LiveUserMap').then(m => m.LiveUserMap),
  { ssr: false },
);

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const CHANNEL_PREFIX = 'home-locations-';
const WINDOW_TARGET_BLANK = '_blank';
const COORD_PRECISION = 4;
const LOCATION_HELP_STEP_KEYS = [
  'LOCATION.HELP_STEPS.IOS_SERVICES',
  'LOCATION.HELP_STEPS.IOS_SAFARI',
  'LOCATION.HELP_STEPS.DESKTOP_CHROME',
  'LOCATION.HELP_STEPS.DESKTOP_SAFARI',
  'LOCATION.HELP_STEPS.RELOAD',
] as const;

interface LocatorAppProps {
  homeId: number;
  userId: string;
  email: string;
}

interface MemberRowProps {
  username: string;
  lat: number;
  lng: number;
  isSelf: boolean;
}

function MemberRow({ username, lat, lng, isSelf }: MemberRowProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
      <span className="font-medium truncate">
        {isSelf ? t('LOCATOR.YOU_LABEL') : username}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-gray-500">
          {lat.toFixed(COORD_PRECISION)}, {lng.toFixed(COORD_PRECISION)}
        </span>
        <a
          href={`${GOOGLE_MAPS_BASE}${lat},${lng}`}
          target={WINDOW_TARGET_BLANK}
          rel="noreferrer"
          className="text-blue-600 text-xs underline"
        >
          {t('LOCATOR.VIEW_ON_GOOGLE_MAPS')}
        </a>
      </span>
    </div>
  );
}

function ViewingRow({ username }: { username: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
      <span className="font-medium truncate">{username}</span>
      <span className="text-gray-400 text-xs italic shrink-0">
        {t('LOCATOR.VIEWING')}
      </span>
    </div>
  );
}

function ConnectionBanner({ status }: { status: ConnectionStatus }) {
  const { t } = useTranslation();
  if (status === CONNECTION_STATUS.ERROR) {
    return (
      <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
        {t('CONNECTION.ERROR')}
      </div>
    );
  }
  if (status === CONNECTION_STATUS.CONNECTING) {
    return (
      <div className="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
        {t('CONNECTION.CONNECTING')}
      </div>
    );
  }
  return null;
}

function GeoErrorHelp({ error }: { error: string }) {
  const { t } = useTranslation();
  return (
    <div className="text-sm">
      <p className="text-red-500">{error}</p>
      <details className="mt-1">
        <summary className="text-blue-600 cursor-pointer text-xs">
          {t('LOCATION.FIX_SETTINGS')}
        </summary>
        <ul className="mt-2 list-disc pl-5 text-gray-600 text-xs space-y-1">
          {LOCATION_HELP_STEP_KEYS.map(key => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function LocatorApp({ homeId, userId, email }: LocatorAppProps) {
  const { t } = useTranslation();
  const [sharing, setSharing] = useState(false);
  const { lat, lng, error: geoError } = useGeolocation();

  const { users: liveUsers, connectionStatus } = useLiveLocations(
    supabase as unknown as SupabaseLike,
    `${CHANNEL_PREFIX}${homeId}`,
    userId,
    email,
    sharing ? lat : null,
    sharing ? lng : null,
  );

  const hasLocation = lat !== null && lng !== null;
  const sharingUsers = useMemo(
    () => liveUsers.filter(isSharingUser),
    [liveUsers],
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-49px)]">
      {sharingUsers.length > 0 && (
        <div className="flex-1">
          <LiveUserMap users={sharingUsers} currentUserId={userId} />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 border-t border-gray-200">
        <ConnectionBanner status={connectionStatus} />

        <div className="flex items-center justify-end">
          <button
            className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors ${
              sharing
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50`}
            disabled={!hasLocation}
            onClick={() => setSharing(s => !s)}
          >
            {sharing ? t('LOCATOR.STOP') : t('LOCATOR.SHARE')}
          </button>
        </div>

        {geoError && <GeoErrorHelp error={geoError} />}

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {liveUsers.length === 0 ? (
            <p className="text-sm text-gray-400">
              {t('LOCATOR.MEMBERS_EMPTY')}
            </p>
          ) : (
            liveUsers.map(user =>
              isSharingUser(user) ? (
                <MemberRow
                  key={user.userId}
                  username={user.username}
                  lat={user.lat}
                  lng={user.lng}
                  isSelf={user.userId === userId}
                />
              ) : (
                <ViewingRow key={user.userId} username={user.username} />
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
