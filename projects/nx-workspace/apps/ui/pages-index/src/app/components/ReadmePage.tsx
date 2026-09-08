import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { MarkdownViewer } from '@vigilant-broccoli/react-utility';
import { useTranslation } from '../i18n';
import { PageHeader } from './PageHeader';

export const PARSE_KIND = {
  TEXT: 'text',
  NPM_REGISTRY: 'npm-registry',
} as const;
type ParseKind = (typeof PARSE_KIND)[keyof typeof PARSE_KIND];

interface ReadmeSource {
  url: string;
  parseKind: ParseKind;
}

interface ReadmePageProps {
  title: string;
  source: ReadmeSource | null;
  externalHref?: string;
  externalLabel?: string;
  notFoundMessage?: string;
}

const CARD_CLASS =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden';
const TOOLBAR_CLASS =
  'flex items-center justify-between gap-4 px-4 sm:px-6 py-2 border-b border-gray-200 dark:border-gray-700 text-sm';
const STATUS_CLASS = 'px-4 sm:px-6 py-4 text-sm';

const parseResponse = (
  res: Response,
  parseKind: ParseKind,
): Promise<string> => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (parseKind === PARSE_KIND.NPM_REGISTRY) {
    return res.json().then(data => data.readme ?? '');
  }
  return res.text();
};

export function ReadmePage({
  title,
  source,
  externalHref,
  externalLabel,
  notFoundMessage,
}: ReadmePageProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setContent(null);
    setError(null);
    fetch(source.url)
      .then(res => parseResponse(res, source.parseKind))
      .then(text => {
        if (!cancelled) setContent(text);
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.url, source?.parseKind]);

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-16">
      <PageHeader title={title} />

      {!source && notFoundMessage && (
        <p className="text-sm text-red-500">{notFoundMessage}</p>
      )}

      {source && (
        <div className={CARD_CLASS}>
          <div className={TOOLBAR_CLASS}>
            <span className="font-semibold text-gray-500 dark:text-gray-400 underline underline-offset-4">
              {t('README_PAGE.README_LABEL')}
            </span>
            {externalHref && (
              <a
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:underline"
              >
                {externalLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {error && (
            <p className={`${STATUS_CLASS} text-red-500`}>
              {t('README_PAGE.ERROR', { message: error })}
            </p>
          )}
          {!error && content === null && (
            <p className={`${STATUS_CLASS} text-gray-400`}>
              {t('README_PAGE.LOADING')}
            </p>
          )}
          {!error && content && <MarkdownViewer content={content} />}
        </div>
      )}
    </main>
  );
}
