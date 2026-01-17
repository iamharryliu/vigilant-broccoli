'use client';

import { useEffect, useState } from 'react';
import { LinkGroupComponent } from './link-group.component';
import { QUICK_LINKS } from '../constants/quick-links';

const LOCAL_STORAGE_KEY = 'quick-links-grouped-state';

export function QuickLinksComponent() {
  const [isGrouped, setIsGrouped] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState !== null) {
      setIsGrouped(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(isGrouped));
    }
  }, [isGrouped, isClient]);

  return (
    <LinkGroupComponent
      title="Quick Links"
      links={QUICK_LINKS}
      grouped={isGrouped}
      onGroupedChange={setIsGrouped}
    />
  );
}
