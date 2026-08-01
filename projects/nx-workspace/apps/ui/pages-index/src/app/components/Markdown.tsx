import { MarkdownViewer } from '@vigilant-broccoli/react-utility';

export function Markdown({ content }: { content: string }) {
  return <MarkdownViewer content={content} />;
}
