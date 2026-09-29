import { lazy, Suspense } from 'react';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

const ClaudeContextViewer = lazy(
  () => import('../components/ClaudeContextViewer'),
);

export function ClaudeContextPage() {
  const { t } = useTranslation();
  usePageTitle(t('CLAUDE_CONTEXT_PAGE.TITLE'));

  return (
    <main className="flex h-dvh flex-col p-2 sm:p-4">
      <Suspense
        fallback={
          <p className="text-sm text-gray-400">
            {t('CLAUDE_CONTEXT_PAGE.LOADING')}
          </p>
        }
      >
        <ClaudeContextViewer />
      </Suspense>
    </main>
  );
}
