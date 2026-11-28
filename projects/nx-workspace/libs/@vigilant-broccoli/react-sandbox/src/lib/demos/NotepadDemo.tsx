import { CSSProperties, useState } from 'react';
import { SyncedTextEditor } from '@vigilant-broccoli/react-lib';
import { MarkdownPreviewPane } from '@vigilant-broccoli/react-lib-higher-level';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const DEFAULT_CONTENT = `function greet(name) {
console.log('Hello, ' + name);
}

greet('world');`;

const MARKDOWN_CONTENT = `# Weekend plan

- [x] Groceries
- [ ] **Laundry**
- [ ] Call [the plumber](https://example.com)`;

const EDITOR_STYLE = { height: '360px' } as const;

interface NotepadDemoProps {
  initialContent?: string;
  style?: CSSProperties;
  markdownPreview?: boolean;
}

export const NotepadDemo = ({
  initialContent = DEFAULT_CONTENT,
  style = EDITOR_STYLE,
  markdownPreview = false,
}: NotepadDemoProps) => {
  const [content, setContent] = useState(initialContent);

  // With the prop off the pane renders the editor alone, so the editor
  // carries the size; with it on the pane does.
  return (
    <MarkdownPreviewPane
      markdownPreview={markdownPreview}
      content={content}
      style={style}
      renderEditor={() => (
        <SyncedTextEditor
          content={content}
          onChange={setContent}
          isLoading={false}
          style={markdownPreview ? undefined : style}
        />
      )}
    />
  );
};

export const NotepadDemos = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.NOTEPAD.PREVIEW_OFF')}>
        <NotepadDemo />
      </DemoSection>
      <DemoSection title={t('DEMO_SECTION.NOTEPAD.PREVIEW_ON')}>
        <NotepadDemo initialContent={MARKDOWN_CONTENT} markdownPreview />
      </DemoSection>
    </div>
  );
};
