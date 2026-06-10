import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { LoadingSpinner } from './loading-spinner';

type Props = {
  filepath: string;
};

export function MarkdownPage({ filepath }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHtml(null);
    setError(null);
    let cancelled = false;
    fetch(filepath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${filepath}`);
        return res.text();
      })
      .then(async text => {
        const parsed = await marked.parse(text, { async: true });
        if (!cancelled) setHtml(parsed);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [filepath]);

  if (error)
    return <div className="text-sm text-red-500">Failed to load: {error}</div>;
  if (html === null) return <LoadingSpinner header="Loading..." />;
  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
