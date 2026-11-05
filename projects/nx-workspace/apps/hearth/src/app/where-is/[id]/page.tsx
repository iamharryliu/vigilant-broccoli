'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '../../../lib/routes';
import { useIsMobile } from '../../../lib/use-is-mobile';
import { WhereIsDetailPageContent } from '../WhereIsDetailPageContent';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';

export default function WhereIsDetailPage() {
  usePageTitle(PAGE_TITLES.WHERE_IS_DETAIL);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isMobile) {
      router.replace(ROUTES.WHERE_IS_DASHBOARD_ITEM(id));
    }
  }, [ready, isMobile, id, router]);

  if (!ready || !isMobile) return null;

  return <WhereIsDetailPageContent id={id} />;
}
