'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../libs/supabase';
import { ROUTES } from '../../lib/routes';

export default function CalendarPage() {
  const router = useRouter();

  useEffect(() => {
    supabase
      .from('homes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          router.replace(ROUTES.HOME_CALENDAR(data.id));
        } else {
          router.replace(ROUTES.HOMES);
        }
      });
  }, [router]);

  return null;
}
