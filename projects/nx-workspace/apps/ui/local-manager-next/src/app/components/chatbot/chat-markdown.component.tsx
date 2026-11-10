'use client';
import { memo, useMemo, type ComponentProps, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.css';
import { CopyButton } from '@vigilant-broccoli/react-lib';

const LANGUAGE_CLASS_PATTERN = /language-([\w+-]+)/;
const TRAILING_NEWLINE_PATTERN = /\n$/;

const extractText = (node: ReactNode): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  return '';
};

const highlightCode = (code: string, language?: string): string | null => {
  if (!language || !hljs.getLanguage(language)) return null;
  return hljs.highlight(code, { language, ignoreIllegals: true }).value;
};

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const html = useMemo(() => highlightCode(code, language), [code, language]);

  return (
    <div className="not-prose my-2 overflow-hidden rounded-md bg-[#0d1117] text-[#e6edf3]">
      <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-400 dark:text-gray-400">
        <span>{language ?? 'text'}</span>
        <CopyButton text={code} label="Copy code" />
      </div>
      <pre className="m-0 overflow-x-auto px-3 pb-3 text-sm">
        {html ? (
          <code
            className="hljs !bg-transparent !p-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
};

// react-markdown v10 has no `inline` flag: a fenced block arrives as a <pre>
// wrapping a <code>, so the block is handled on `pre` and inline code is left
// to the default renderer.
const MarkdownPre = ({ children }: ComponentProps<'pre'>) => {
  const codeProps = (children as { props?: ComponentProps<'code'> } | undefined)
    ?.props;
  const language = codeProps?.className?.match(LANGUAGE_CLASS_PATTERN)?.[1];
  const code = extractText(codeProps?.children).replace(
    TRAILING_NEWLINE_PATTERN,
    '',
  );
  return <CodeBlock code={code} language={language} />;
};

const MARKDOWN_COMPONENTS: Components = { pre: MarkdownPre };
const REMARK_PLUGINS = [remarkGfm];

export const ChatMarkdown = memo(({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={REMARK_PLUGINS}
    components={MARKDOWN_COMPONENTS}
  >
    {content}
  </ReactMarkdown>
));
ChatMarkdown.displayName = 'ChatMarkdown';
