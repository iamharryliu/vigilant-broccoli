'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EMBED_TARGET_PARAM } from '@vigilant-broccoli/common-js';
import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { ProtectedRoute } from '../components/protected-route';
import { APP_NAME } from '../app.const';
import { findEmbedLink } from '../constants/quick-links';

const EmbedPlaceholder = () => (
  <main
    className={`${PAGE_HEIGHT} overflow-hidden bg-gray-50 dark:bg-gray-950`}
  />
);

const LoadingFrame = ({ src, title }: { src: string; title: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative min-h-0 w-full flex-1 bg-gray-50 dark:bg-gray-950">
      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500 motion-reduce:animate-none dark:border-gray-700 dark:border-t-gray-400" />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        className={`block h-full w-full border-0 pb-[env(safe-area-inset-bottom)] transition-opacity duration-200 motion-reduce:transition-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

const EmbedFrame = () => {
  const params = useSearchParams();
  const link = findEmbedLink(params.get(EMBED_TARGET_PARAM));
  useDocumentTitle(link ? `${link.label} | ${APP_NAME}` : APP_NAME);

  return (
    <main
      className={`flex ${PAGE_HEIGHT} flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}
    >
      {link && (
        <LoadingFrame key={link.target} src={link.target} title={link.label} />
      )}
    </main>
  );
};

export default function EmbedPage() {
  return (
    <ProtectedRoute fallback={<EmbedPlaceholder />}>
      <Suspense fallback={<EmbedPlaceholder />}>
        <EmbedFrame />
      </Suspense>
    </ProtectedRoute>
  );
}
