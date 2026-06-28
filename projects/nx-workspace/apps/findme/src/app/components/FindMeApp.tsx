'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@vigilant-broccoli/react-lib';
import {
  CONNECTION_STATUS,
  isSharingUser,
  useLiveLocations,
} from '../hooks/useLiveLocations';
import { useTranslation } from '../i18n';

const LiveUserMap = dynamic(
  () => import('./LiveUserMap').then(m => m.LiveUserMap),
  { ssr: false },
);

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const USER_PREFIX = 'user-';
const USER_ID_LENGTH = 6;
const USER_ID_STORAGE_KEY = 'findme-user-id';
const USERNAME_STORAGE_KEY = 'findme-username';
const NAME_SEPARATOR = '-';
const WINDOW_TARGET_BLANK = '_blank';
const RANDOMIZE_ICON = '🎲';
const LOCATION_HELP_STEP_KEYS = [
  'LOCATION.HELP_STEPS.IOS_SERVICES',
  'LOCATION.HELP_STEPS.IOS_SAFARI',
  'LOCATION.HELP_STEPS.DESKTOP_CHROME',
  'LOCATION.HELP_STEPS.DESKTOP_SAFARI',
  'LOCATION.HELP_STEPS.RELOAD',
] as const;

const NAME_ADJECTIVES = [
  'swift',
  'brave',
  'sunny',
  'witty',
  'mellow',
  'cosmic',
  'fuzzy',
  'nimble',
  'jolly',
  'curious',
  'breezy',
  'lucky',
];

const NAME_NOUNS = [
  'otter',
  'falcon',
  'panda',
  'comet',
  'maple',
  'badger',
  'pixel',
  'walrus',
  'sparrow',
  'cactus',
  'dolphin',
  'gecko',
];

const randomItem = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const randomUsername = () =>
  `${randomItem(NAME_ADJECTIVES)}${NAME_SEPARATOR}${randomItem(NAME_NOUNS)}`;

const randomUserId = () =>
  `${USER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + USER_ID_LENGTH)}`;

const getOrCreateUserId = () => {
  const existing = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing) return existing;
  const id = randomUserId();
  localStorage.setItem(USER_ID_STORAGE_KEY, id);
  return id;
};

const getOrCreateUsername = () => {
  const existing = localStorage.getItem(USERNAME_STORAGE_KEY);
  if (existing) return existing;
  const name = randomUsername();
  localStorage.setItem(USERNAME_STORAGE_KEY, name);
  return name;
};

export function FindMeApp() {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  useEffect(() => {
    setUserId(getOrCreateUserId());
    setUsername(getOrCreateUsername());
  }, []);

  const updateUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem(USERNAME_STORAGE_KEY, name);
  };

  const [sharing, setSharing] = useState(false);
  const { lat, lng, error: geoError } = useGeolocation();
  const { users: liveUsers, connectionStatus } = useLiveLocations(
    userId,
    username,
    sharing ? lat : null,
    sharing ? lng : null,
  );

  const hasLocation = lat !== null && lng !== null;
  const sharingUsers = useMemo(
    () => liveUsers.filter(isSharingUser),
    [liveUsers],
  );

  return (
    <div className="flex flex-col h-[100dvh]">
      {sharingUsers.length > 0 && (
        <div className="flex-1">
          <LiveUserMap users={sharingUsers} currentUserId={userId} />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 bg-white border-t border-gray-200">
        {connectionStatus === CONNECTION_STATUS.ERROR && (
          <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {t('CONNECTION.ERROR')}
          </div>
        )}
        {connectionStatus === CONNECTION_STATUS.CONNECTING && (
          <div className="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
            {t('CONNECTION.CONNECTING')}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-gray-500 shrink-0">
              {t('USER.YOU_FIELD')}
            </span>
            <input
              type="text"
              value={username}
              placeholder={t('USER.USERNAME_PLACEHOLDER')}
              onChange={e => updateUsername(e.target.value)}
              className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              aria-label={t('USER.RANDOMIZE')}
              title={t('USER.RANDOMIZE')}
              onClick={() => updateUsername(randomUsername())}
              className="shrink-0 rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
            >
              {RANDOMIZE_ICON}
            </button>
          </div>
          <button
            className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors ${
              sharing
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50`}
            disabled={!hasLocation}
            onClick={() => setSharing(s => !s)}
          >
            {sharing ? t('SHARING.STOP') : t('SHARING.SHARE')}
          </button>
        </div>

        {geoError && (
          <div className="text-sm">
            <p className="text-red-500">{geoError}</p>
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
        )}

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {liveUsers.length === 0 ? (
            <p className="text-sm text-gray-400">{t('USERS.EMPTY')}</p>
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
                    {isSelf ? t('USER.YOU_LABEL') : user.username}
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
                        {t('SHARING.VIEW_ON_GOOGLE_MAPS')}
                      </a>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      {t('SHARING.VIEWING')}
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
