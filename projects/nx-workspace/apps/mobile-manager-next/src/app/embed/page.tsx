'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EMBED_TARGET_PARAM } from '@vigilant-broccoli/common-js';
import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { PAGE_HEIGHT } from '../components/app-shell.constants';
import { ProtectedRoute } from '../components/protected-route';
import {
  APP_NAME,
  APP_ROUTE,
  EMBED_BACK_ROUTES,
  EMBED_FROM_PARAM,
} from '../app.const';
import { findEmbedLink } from '../constants/quick-links';

const BACK_LABEL = 'Back';

const EmbedFrame = () => {
  const params = useSearchParams();
  const link = findEmbedLink(params.get(EMBED_TARGET_PARAM));
  const from = params.get(EMBED_FROM_PARAM) ?? '';
  const backRoute = EMBED_BACK_ROUTES.includes(from) ? from : APP_ROUTE.HOME;
  useDocumentTitle(link ? `${link.label} | ${APP_NAME}` : APP_NAME);

  return (
    <main
      className={`flex ${PAGE_HEIGHT} flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}
    >
      <nav className="flex h-11 shrink-0 items-center border-b border-gray-200 px-2 dark:border-gray-800">
        <Link
          href={backRoute}
          className="flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={18} />
          {BACK_LABEL}
        </Link>
        {link && (
          <span className="ml-2 truncate text-sm font-medium">
            {link.label}
          </span>
        )}
      </nav>
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
