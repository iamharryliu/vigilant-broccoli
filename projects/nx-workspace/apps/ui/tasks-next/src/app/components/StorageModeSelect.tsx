'use client';

import { Cloud, Database, HardDrive } from 'lucide-react';
import { Select } from '@vigilant-broccoli/react-lib';
import {
  STORAGE_MODE,
  setStorageMode,
  useStorageMode,
} from '../../../libs/storage-mode';
import { useTranslation } from '../i18n';

const MODE_LABEL_KEY = {
  [STORAGE_MODE.GOOGLE]: 'MODE.GOOGLE',
  [STORAGE_MODE.DATABASE]: 'MODE.DATABASE',
  [STORAGE_MODE.LOCAL]: 'MODE.LOCAL',
} as const;

const MODE_ICON = {
  [STORAGE_MODE.GOOGLE]: <Cloud size={16} />,
  [STORAGE_MODE.DATABASE]: <Database size={16} />,
  [STORAGE_MODE.LOCAL]: <HardDrive size={16} />,
};

// Shown in the home and Settings headers so the active store is always visible.
export function StorageModeSelect() {
  const { t } = useTranslation();
  return (
    <Select
      aria-label={t('SETTINGS.STORAGE.TITLE')}
      value={useStorageMode()}
      options={Object.values(STORAGE_MODE)}
      onValueChange={setStorageMode}
      renderItem={option => (
        <span className="flex items-center gap-2">
          {MODE_ICON[option]}
          {t(MODE_LABEL_KEY[option])}
        </span>
      )}
    />
  );
}
