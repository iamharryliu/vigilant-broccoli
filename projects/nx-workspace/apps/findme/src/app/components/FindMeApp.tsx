'use client';

import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@vigilant-broccoli/react-lib';
import {
  CONNECTION_STATUS,
  isSharingUser,
  useLiveLocations,
} from '../hooks/useLiveLocations';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { FocusedPoi } from './FindMeMap';
import { NearbyTab } from './NearbyTab';
import { PeopleTab } from './PeopleTab';
import { PlaceWithDistance, getPlaceDistanceMetres } from '../../lib/overpass';
import { useTranslation } from '../i18n';

const FindMeMap = dynamic(() => import('./FindMeMap').then(m => m.FindMeMap), {
  ssr: false,
});

const TAB = { MAP: 'map', NEARBY: 'nearby', PEOPLE: 'people' } as const;
type Tab = (typeof TAB)[keyof typeof TAB];
const TABS: readonly {
  id: Tab;
  labelKey: 'TABS.MAP' | 'TABS.NEARBY' | 'TABS.PEOPLE';
}[] = [
  { id: TAB.MAP, labelKey: 'TABS.MAP' },
  { id: TAB.NEARBY, labelKey: 'TABS.NEARBY' },
  { id: TAB.PEOPLE, labelKey: 'TABS.PEOPLE' },
];
const TAB_ID_PREFIX = 'findme-tab-';
const PANEL_ID_PREFIX = 'findme-panel-';
const KEY = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;
const USER_PREFIX = 'user-';
const USER_ID_LENGTH = 6;
const USER_ID_STORAGE_KEY = 'findme-user-id';
const USERNAME_STORAGE_KEY = 'findme-username';
const NAME_SEPARATOR = '-';
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
  const location = useMemo(
    () => (lat !== null && lng !== null ? { lat, lng } : null),
    [lat, lng],
  );
  const sharingUsers = useMemo(
    () => liveUsers.filter(isSharingUser),
    [liveUsers],
  );

  const [activeTab, setActiveTab] = useState<Tab>(TAB.MAP);
  const [selection, setSelection] = useState<{
    requestKey: number;
    place: PlaceWithDistance;
  } | null>(null);
  const {
    places,
    status: nearbyStatus,
    hasLoaded: nearbyHasLoaded,
    refresh: refreshNearby,
  } = useNearbyPlaces(location, activeTab === TAB.NEARBY);

  const focusedPoi = useMemo<FocusedPoi | null>(
    () =>
      selection && {
        requestKey: selection.requestKey,
        place: {
          ...selection.place,
          distanceMetres: location
            ? getPlaceDistanceMetres(selection.place, location)
            : selection.place.distanceMetres,
        },
      },
    [selection, location],
  );

  const showOnMap = (place: PlaceWithDistance) => {
    setSelection(prev => ({ requestKey: (prev?.requestKey ?? 0) + 1, place }));
    setActiveTab(TAB.MAP);
  };

  const handleTabKeyDown = (e: KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    const nextIndex =
      e.key === KEY.RIGHT
        ? (index + 1) % TABS.length
        : e.key === KEY.LEFT
          ? (index - 1 + TABS.length) % TABS.length
          : e.key === KEY.HOME
            ? 0
            : e.key === KEY.END
              ? last
              : null;
    if (nextIndex === null) return;
    e.preventDefault();
    const next = TABS[nextIndex].id;
    setActiveTab(next);
    document.getElementById(`${TAB_ID_PREFIX}${next}`)?.focus();
  };

  const poiCategory = focusedPoi
    ? t(`NEARBY.CATEGORY.${focusedPoi.place.category}`)
    : '';
  const poiName = focusedPoi
    ? (focusedPoi.place.name ?? t('NEARBY.UNNAMED', { category: poiCategory }))
    : '';
  const showMapEmptyState = !hasLocation && sharingUsers.length === 0;
  const mapNotice = !hasLocation
    ? sharingUsers.length === 0
      ? t('MAP.LOCATION_UNAVAILABLE')
      : null
    : sharingUsers.filter(u => u.userId !== userId).length === 0
      ? t('MAP.NO_SHARING_USERS')
      : null;

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="p-3 sm:p-4 flex flex-col gap-3 bg-white border-b border-gray-200">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
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
      </div>

      <div
        role="tablist"
        aria-label={t('TABS.LABEL')}
        className="flex border-b border-gray-200 bg-white"
      >
        {TABS.map(({ id, labelKey }, index) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              id={`${TAB_ID_PREFIX}${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${PANEL_ID_PREFIX}${id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(id)}
              onKeyDown={e => handleTabKeyDown(e, index)}
              className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                selected
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          role="tabpanel"
          id={`${PANEL_ID_PREFIX}${TAB.MAP}`}
          aria-labelledby={`${TAB_ID_PREFIX}${TAB.MAP}`}
          hidden={activeTab !== TAB.MAP}
          className="absolute inset-0"
        >
          <FindMeMap
            self={location}
            users={sharingUsers}
            currentUserId={userId}
            active={activeTab === TAB.MAP}
            poi={focusedPoi}
            poiName={poiName}
            poiCategory={poiCategory}
          />
          {mapNotice && (
            <div
              role="status"
              className={`absolute z-[1000] text-sm text-gray-600 ${
                showMapEmptyState
                  ? 'inset-0 flex items-center justify-center bg-white/90 p-6 text-center'
                  : 'left-3 right-3 top-3 rounded bg-white/95 px-3 py-2 shadow'
              }`}
            >
              {mapNotice}
            </div>
          )}
          {hasLocation && !sharing && (
            <p className="absolute bottom-6 left-3 right-3 z-[1000] rounded bg-white/95 px-3 py-1 text-xs text-gray-600 shadow sm:right-auto">
              {t('MAP.SELF_LOCAL_ONLY')}
            </p>
          )}
        </div>
        <div
          role="tabpanel"
          id={`${PANEL_ID_PREFIX}${TAB.NEARBY}`}
          aria-labelledby={`${TAB_ID_PREFIX}${TAB.NEARBY}`}
          hidden={activeTab !== TAB.NEARBY}
          className="absolute inset-0 overflow-y-auto bg-white"
        >
          <NearbyTab
            places={places}
            status={nearbyStatus}
            hasLoaded={nearbyHasLoaded}
            hasLocation={hasLocation}
            onRefresh={refreshNearby}
            onShowOnMap={showOnMap}
          />
        </div>
        <div
          role="tabpanel"
          id={`${PANEL_ID_PREFIX}${TAB.PEOPLE}`}
          aria-labelledby={`${TAB_ID_PREFIX}${TAB.PEOPLE}`}
          hidden={activeTab !== TAB.PEOPLE}
          className="absolute inset-0 overflow-y-auto bg-white"
        >
          <PeopleTab users={liveUsers} currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
