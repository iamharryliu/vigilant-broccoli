'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsed = await marked.parse(content);
      setHtml(parsed);
    };

    parseMarkdown();
  }, [content]);

  return (
    <div className="w-full h-full overflow-auto">
      <div
        className="prose dark:prose-invert max-w-none px-6 py-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
