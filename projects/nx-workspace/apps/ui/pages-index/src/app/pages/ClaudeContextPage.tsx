import { lazy, Suspense } from 'react';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';

const ClaudeContextViewer = lazy(
  () => import('../components/ClaudeContextViewer'),
);

export function ClaudeContextPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex h-[100dvh] max-w-6xl flex-col overflow-hidden px-3 sm:px-6 pt-6 pb-4">
      <PageHeader title={t('CLAUDE_CONTEXT_PAGE.TITLE')} />
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
