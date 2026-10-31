'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EMBED_TARGET_PARAM } from '../../app.const';
import { QUICK_LINKS } from '../../constants/quick-links';
import { usePageTitle } from '../../use-page-title';

function EmbedFrame() {
  const target = useSearchParams().get(EMBED_TARGET_PARAM);
  const link = QUICK_LINKS.find(
    quickLink => quickLink.embed && quickLink.target === target,
  );
  usePageTitle(link?.label ?? '');

  if (!link) return null;

  return (
    <iframe
      src={link.target}
      title={link.label}
      className="block min-h-0 min-w-0 h-full w-full flex-1 border-0"
    />
  );
}

export default function Page() {
  return (
    <Suspense>
      <EmbedFrame />
    </Suspense>
  );
}
