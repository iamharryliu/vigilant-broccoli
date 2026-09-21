import { lazy, Suspense } from 'react';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { WIDE_FULL_HEIGHT_PAGE_CLASS } from '../consts/layout';

const ClaudeContextViewer = lazy(
  () => import('../components/ClaudeContextViewer'),
);

export function ClaudeContextPage() {
  const { t } = useTranslation();

  return (
    <main className={WIDE_FULL_HEIGHT_PAGE_CLASS}>
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
