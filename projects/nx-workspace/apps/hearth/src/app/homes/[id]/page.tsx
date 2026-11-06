'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../../lib/routes';
import { useHome } from '../../providers/home-provider';
import { DeleteHomeCard } from '../components/DeleteHomeCard';
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
  const { homes } = useHome();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <button
        onClick={() => router.push(ROUTES.HOMES)}
        className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
      >
        ← Homes
      </button>
      <HomeDetailView homeId={id} />
      {homes.find(home => home.id === Number(id))?.isOwner && (
        <DeleteHomeCard
          homeId={Number(id)}
          onDeleted={() => router.push(ROUTES.HOMES)}
        />
      )}
    </div>
  );
}
