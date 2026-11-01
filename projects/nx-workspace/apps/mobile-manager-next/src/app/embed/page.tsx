'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EMBED_TARGET_PARAM } from '@vigilant-broccoli/common-js';
import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { ProtectedRoute } from '../components/protected-route';
import { APP_NAME } from '../app.const';
import { findEmbedLink } from '../constants/quick-links';

const EmbedFrame = () => {
  const params = useSearchParams();
  const link = findEmbedLink(params.get(EMBED_TARGET_PARAM));
  useDocumentTitle(link ? `${link.label} | ${APP_NAME}` : APP_NAME);

  return (
    <main
      className={`flex ${PAGE_HEIGHT} flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}
    >
      {link && (
        <iframe
          src={link.target}
          title={link.label}
          className="block min-h-0 w-full flex-1 border-0 pb-[env(safe-area-inset-bottom)]"
        />
      )}
    </main>
  );
};

export default function EmbedPage() {
  return (
    <ProtectedRoute>
      <Suspense>
        <EmbedFrame />
      </Suspense>
    </ProtectedRoute>
  );
}
