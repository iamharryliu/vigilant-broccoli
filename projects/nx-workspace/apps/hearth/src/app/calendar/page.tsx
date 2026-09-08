'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHome } from '../providers/home-provider';
import { ROUTES } from '../../lib/routes';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function CalendarPage() {
  usePageTitle(PAGE_TITLES.CALENDAR);
  const router = useRouter();
  const { selectedHomeId } = useHome();

  useEffect(() => {
    if (selectedHomeId === null) return;
    router.replace(ROUTES.HOME_CALENDAR(selectedHomeId));
  }, [selectedHomeId, router]);

  return null;
}
