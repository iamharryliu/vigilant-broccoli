'use client';

import { useEffect, useState } from 'react';
import { LinkGroupComponent } from './link-group.component';
import { QUICK_LINKS } from '../constants/quick-links';

const LOCAL_STORAGE_KEY = 'quick-links-grouped-state';

export function QuickLinksComponent() {
  const [isGrouped, setIsGrouped] = useState<boolean | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    setIsGrouped(savedState === null ? true : savedState === 'true');
  }, []);

  useEffect(() => {
    if (isGrouped !== null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(isGrouped));
    }
  }, [isGrouped]);

  if (isGrouped === null) {
    return null;
  }

  return (
    <LinkGroupComponent
      title="Quick Links"
      links={QUICK_LINKS}
      grouped={isGrouped}
      onGroupedChange={setIsGrouped}
    />
  );
}
