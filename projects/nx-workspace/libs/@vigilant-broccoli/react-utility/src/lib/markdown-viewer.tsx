import { useEffect, useState } from 'react';
import { marked } from 'marked';

const CLS = {
  ROOT: 'w-full h-full overflow-auto',
  PROSE: 'prose dark:prose-invert max-w-none px-6 py-4',
} as const;

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    marked.parse(content, { async: true }).then(setHtml);
  }, [content]);

  return (
    <div className={CLS.ROOT}>
      <div className={CLS.PROSE} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
