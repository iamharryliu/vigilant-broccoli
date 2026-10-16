'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ROUTES } from '../../../lib/routes';
import { useIsMobile } from '../../../lib/use-is-mobile';
import { WhereIsDetail } from '../where-is-detail';
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <WhereIsDetail
        id={id}
        variant="page"
        onDeleted={() => router.push(ROUTES.WHERE_IS)}
      />
    </div>
  );
}
