'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '../../lib/routes';
import { WhereIsDetail } from './where-is-detail';

export function WhereIsDetailPageContent({ id }: { id: string }) {
  const router = useRouter();
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
