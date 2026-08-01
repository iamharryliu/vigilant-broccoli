import { MarkdownViewer } from '@vigilant-broccoli/react-utility';

const CARD_CLASS =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden';

export function Markdown({ content }: { content: string }) {
  return (
    <div className={CARD_CLASS}>
      <MarkdownViewer content={content} />
    </div>
  );
}
