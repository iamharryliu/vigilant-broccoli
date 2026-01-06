'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownViewerProps {
  content: string;
  fileName?: string;
}

export function MarkdownViewer({ content, fileName }: MarkdownViewerProps) {
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
      {fileName && (
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 mb-4">
          <h2 className="text-lg font-semibold">{fileName}</h2>
        </div>
      )}
      <div
        className="prose dark:prose-invert max-w-none px-6 py-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
