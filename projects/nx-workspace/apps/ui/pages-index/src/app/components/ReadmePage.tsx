import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '../i18n';
import { PageHeader } from './PageHeader';
import { Markdown } from './Markdown';

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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        title={title}
        action={
          externalHref && (
            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              {externalLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )
        }
      />

      {!source && notFoundMessage && (
        <p className="text-sm text-red-500">{notFoundMessage}</p>
      )}
      {source && error && (
        <p className="text-sm text-red-500">
          {t('README_PAGE.ERROR', { message: error })}
        </p>
      )}
      {source && !error && content === null && (
        <p className="text-sm text-gray-400">{t('README_PAGE.LOADING')}</p>
      )}
      {source && content && <Markdown content={content} />}
    </main>
  );
}
