'use client';

import {
  LiveUserMap as SharedLiveUserMap,
  SharingUser,
} from '@vigilant-broccoli/react-lib/live-location-map';
import { useTranslation } from '../../i18n';

interface LiveUserMapProps {
  users: SharingUser[];
  currentUserId: string;
}

export function LiveUserMap({ users, currentUserId }: LiveUserMapProps) {
  const { t } = useTranslation();
  return (
    <SharedLiveUserMap
      users={users}
      currentUserId={currentUserId}
      youLabel={t('LOCATOR.YOU_LABEL')}
      openInMapsLabel={t('LOCATOR.OPEN_IN_GOOGLE_MAPS')}
    />
  );
}
