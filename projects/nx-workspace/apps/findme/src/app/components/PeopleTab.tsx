'use client';

import { isSharingUser, LiveUser } from '../hooks/useLiveLocations';
import { useTranslation } from '../i18n';

const GOOGLE_MAPS_BASE = 'https://maps.google.com/?q=';
const COORDINATE_DECIMALS = 4;
const WINDOW_TARGET_BLANK = '_blank';

interface PeopleTabProps {
  users: LiveUser[];
  currentUserId: string;
}

export function PeopleTab({ users, currentUserId }: PeopleTabProps) {
  const { t } = useTranslation();
  const others = users.filter(user => user.userId !== currentUserId);

  if (others.length === 0) {
    return <p className="p-4 text-sm text-gray-400">{t('USERS.EMPTY')}</p>;
  }

  return (
    <ul aria-label={t('PEOPLE.LIST_LABEL')} className="flex flex-col gap-2 p-4">
      {others.map(user => (
        <li
          key={user.userId}
          className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <span className="font-medium">{user.username}</span>
          {isSharingUser(user) ? (
            <span className="flex items-center gap-3">
              <span className="text-gray-500">
                {t('PEOPLE.STATUS_SHARING')} ·{' '}
                {user.lat.toFixed(COORDINATE_DECIMALS)},{' '}
                {user.lng.toFixed(COORDINATE_DECIMALS)}
              </span>
              <a
                href={`${GOOGLE_MAPS_BASE}${user.lat},${user.lng}`}
                target={WINDOW_TARGET_BLANK}
                rel="noreferrer"
                className="text-xs text-blue-600 underline"
              >
                {t('SHARING.VIEW_ON_GOOGLE_MAPS')}
              </a>
            </span>
          ) : (
            <span className="text-xs italic text-gray-400">
              {t('PEOPLE.STATUS_VIEWING')}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
