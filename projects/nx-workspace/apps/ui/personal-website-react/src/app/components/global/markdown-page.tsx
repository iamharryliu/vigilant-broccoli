import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

type Props = {
  content: string;
};

export function MarkdownPage({ content }: Props) {
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(content) as string),
    [content],
  );

  return (
    <div
      className="markdown-content prose dark:prose-invert max-w-none prose-img:inline-block prose-img:my-0 prose-a:no-underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
