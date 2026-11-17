import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { CollapsibleList } from '@vigilant-broccoli/react-lib';
import { createHeadingRenderer, marked } from './markdown-config';
import {
  createNoteLinkClickHandler,
  type RepoLinkBase,
  rewriteRepoRelativeLinks,
  scrollToUrlHash,
} from './note-links';
import {
  type MarkdownSection,
  splitMarkdownSections,
} from './markdown-sections';
import {
  buildSegments,
  openLeadingItems,
  type Segment,
} from './markdown-segments';
import { observeThemeChange, renderMermaidDiagrams } from './mermaid-diagrams';

const CLS = {
  ROOT: 'w-full',
  PROSE:
    'prose dark:prose-invert max-w-none px-4 sm:px-6 py-4 prose-th:align-middle prose-td:align-middle prose-table:block prose-table:overflow-x-auto',
  EDITOR_WRAP: 'flex flex-col h-full',
  TOOLBAR:
    'flex items-center justify-end gap-2 px-4 sm:px-6 py-2 border-b border-gray-200 dark:border-gray-700',
  BTN_BASE: 'px-3 py-1 text-xs rounded',
  BTN_PRIMARY:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
  BTN_SECONDARY:
    'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
  TEXTAREA:
    'flex-1 min-h-0 w-full resize-none px-4 sm:px-6 py-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none',
  SECTION_PROSE:
    'prose dark:prose-invert max-w-none px-1 prose-th:align-middle prose-td:align-middle prose-table:block prose-table:overflow-x-auto',
  SECTIONS: 'px-4 sm:px-6 pb-4',
  ERROR: 'text-xs text-red-500 mr-auto',
} as const;

const COPY = {
  SAVE: 'Save',
  SAVING: 'Saving...',
  CANCEL: 'Cancel',
  SAVE_FAILED: 'Failed to save',
} as const;

interface MarkdownViewerProps {
  content: string;
  filePath?: string;
  saveContent?: (path: string, content: string) => Promise<void>;
  editTrigger?: number;
  onNavigate?: (path: string) => void;
  repoLinkBase?: RepoLinkBase;
  /** Renders each heading of this level as a CollapsibleList item. */
  collapsibleHeadingLevel?: number;
  /** How many leading collapsible sections or `<details>` blocks start open. */
  defaultOpenSections?: number;
}

interface HtmlSection extends MarkdownSection {
  segments: Segment[];
}

interface BlocksProps {
  segments: Segment[];
  filePath?: string;
  onNavigate?: (path: string) => void;
  nested?: boolean;
}

// Collapsed accordion content is unmounted, so nested chunks render their own
// mermaid diagrams when they open; top-level ones are rendered by the viewer.
function HtmlChunk({
  html,
  filePath,
  onNavigate,
  nested,
}: { html: string } & Omit<BlocksProps, 'segments'>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!nested) return;
    renderMermaidDiagrams(el);
    return el
      ? observeThemeChange(el, () => renderMermaidDiagrams(el))
      : undefined;
  }, [html, nested]);
  return (
    <div
      ref={ref}
      className={nested ? CLS.SECTION_PROSE : CLS.PROSE}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={createNoteLinkClickHandler(filePath ?? '', onNavigate)}
    />
  );
}

function Blocks({ segments, filePath, onNavigate, nested }: BlocksProps) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === 'html' ? (
          <HtmlChunk
            key={index}
            html={segment.html}
            filePath={filePath}
            onNavigate={onNavigate}
            nested={nested}
          />
        ) : (
          <div key={index} className={nested ? undefined : CLS.SECTIONS}>
            <CollapsibleList
              items={segment.items.map(item => ({
                id: item.id,
                title: item.title,
                defaultOpen: item.open,
                content: (
                  <Blocks
                    segments={item.segments}
                    filePath={filePath}
                    onNavigate={onNavigate}
                    nested
                  />
                ),
              }))}
            />
          </div>
        ),
      )}
    </>
  );
}

export function MarkdownViewer({
  content,
  filePath,
  saveContent,
  editTrigger,
  onNavigate,
  repoLinkBase,
  collapsibleHeadingLevel,
  defaultOpenSections = 0,
}: MarkdownViewerProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [sections, setSections] = useState<HtmlSection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const render = async (markdown: string) => {
      const raw = await marked.parse(markdown, {
        renderer: createHeadingRenderer(),
        async: true,
      });
      const safe = DOMPurify.sanitize(raw);
      return repoLinkBase ? rewriteRepoRelativeLinks(safe, repoLinkBase) : safe;
    };
    const split = collapsibleHeadingLevel
      ? splitMarkdownSections(content, collapsibleHeadingLevel)
      : { intro: content, sections: [] };
    Promise.all([
      render(split.intro),
      Promise.all(
        split.sections.map(async section => ({
          ...section,
          segments: buildSegments(
            await render(section.markdown),
            `${section.id}-details`,
          ),
        })),
      ),
    ]).then(([introHtml, sectionHtml]) => {
      if (typeof window === 'undefined') return;
      setSegments(
        openLeadingItems(buildSegments(introHtml), defaultOpenSections),
      );
      setSections(sectionHtml);
    });
  }, [content, repoLinkBase?.filePath, collapsibleHeadingLevel]);

  const proseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!segments.length && !sections.length) return;
    const el = proseRef.current;
    renderMermaidDiagrams(el).then(scrollToUrlHash);
    return el
      ? observeThemeChange(el, () => renderMermaidDiagrams(el))
      : undefined;
  }, [segments, sections, isEditing]);

  const canEdit = Boolean(saveContent && filePath);

  useEffect(() => {
    setIsEditing(false);
    setError(null);
    setDraft(content);
  }, [content, filePath]);

  useEffect(() => {
    if (editTrigger && canEdit) startEdit();
  }, [editTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = () => {
    setDraft(content);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
    setDraft(content);
  };

  const save = async () => {
    if (!saveContent || !filePath) return;
    setIsSaving(true);
    setError(null);
    try {
      await saveContent(filePath, draft);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : COPY.SAVE_FAILED);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className={CLS.EDITOR_WRAP}>
        <div className={CLS.TOOLBAR}>
          {error && <span className={CLS.ERROR}>{error}</span>}
          <button
            type="button"
            onClick={cancelEdit}
            className={`${CLS.BTN_BASE} ${CLS.BTN_SECONDARY}`}
            disabled={isSaving}
          >
            {COPY.CANCEL}
          </button>
          <button
            type="button"
            onClick={save}
            className={`${CLS.BTN_BASE} ${CLS.BTN_PRIMARY}`}
            disabled={isSaving}
          >
            {isSaving ? COPY.SAVING : COPY.SAVE}
          </button>
        </div>
        <textarea
          className={CLS.TEXTAREA}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div ref={proseRef} className={CLS.ROOT}>
      <Blocks segments={segments} filePath={filePath} onNavigate={onNavigate} />
      {sections.length > 0 && (
        <div className={CLS.SECTIONS}>
          <CollapsibleList
            key={content}
            items={sections.map((section, index) => ({
              id: section.id,
              title: section.title,
              defaultOpen: index < defaultOpenSections,
              content: (
                <Blocks
                  segments={section.segments}
                  filePath={filePath}
                  onNavigate={onNavigate}
                  nested
                />
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
