'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHome } from '../providers/home-provider';
import { ROUTES } from '../../lib/routes';

export default function CalendarPage() {
  const router = useRouter();
  const { selectedHomeId } = useHome();

  useEffect(() => {
    if (selectedHomeId === null) return;
    router.replace(ROUTES.HOME_CALENDAR(selectedHomeId));
  }, [selectedHomeId, router]);

  return null;
}
