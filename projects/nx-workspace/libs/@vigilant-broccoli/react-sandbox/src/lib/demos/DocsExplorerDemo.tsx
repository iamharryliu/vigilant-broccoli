import { DemoSection } from './DemoSection';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { buttonVariants } from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '@vigilant-broccoli/docs-explorer';

const DOCS_URL = 'https://docs.harryliu.dev/';
const README_PATH =
  'projects/nx-workspace/libs/@vigilant-broccoli/react-lib-higher-level/docs/features/docs-explorer.md';
const README_URL = `https://raw.githubusercontent.com/iamharryliu/vigilant-broccoli/main/${README_PATH}`;
const REPO_BLOB_URL =
  'https://github.com/iamharryliu/vigilant-broccoli/blob/main/';

const COPY = {
  VISIT: 'Open docs.harryliu.dev',
  README: 'Feature doc',
  LOADING: 'Loading feature doc...',
  ERROR: 'Failed to load feature doc',
} as const;

const CARD_CLASS =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden';
const STATUS_CLASS = 'px-4 sm:px-6 py-4 text-sm';

export const DocsExplorerDemo = () => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(README_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
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
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonVariants()} self-start`}
      >
        {COPY.VISIT}
        <ExternalLink className="h-4 w-4" />
      </a>

      <DemoSection title={COPY.README} className="flex flex-col gap-3">
        <div className={CARD_CLASS}>
          {error && (
            <p className={`${STATUS_CLASS} text-red-500`}>
              {COPY.ERROR}: {error}
            </p>
          )}
          {!error && content === null && (
            <p className={`${STATUS_CLASS} text-muted-foreground`}>
              {COPY.LOADING}
            </p>
          )}
          {!error && content && (
            <MarkdownViewer
              content={content}
              filePath={README_PATH}
              onNavigate={path =>
                window.open(`${REPO_BLOB_URL}${path}`, '_blank', 'noopener')
              }
            />
          )}
        </div>
      </DemoSection>
    </div>
  );
};
