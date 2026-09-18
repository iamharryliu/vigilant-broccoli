'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../../lib/routes';
import { HomeDetailView } from '../components/HomeDetailView';
import { PAGE_TITLES, usePageTitle } from '../../../lib/page-title';

export default function HomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  usePageTitle(PAGE_TITLES.HOME_DETAIL);
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button
        onClick={() => router.push(ROUTES.HOMES)}
        className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
      >
        ← Homes
      </button>
      <HomeDetailView homeId={id} />
    </div>
  );
}
