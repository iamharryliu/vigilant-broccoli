import { useEffect, useMemo, useRef, useState } from 'react';
import type { MarkedOptions, Tokens } from 'marked';
import DOMPurify from 'dompurify';
import { createHeadingRenderer, marked } from './markdown-config';
import { createNoteLinkClickHandler, scrollToUrlHash } from './note-links';
import { observeThemeChange, renderMermaidDiagrams } from './mermaid-diagrams';

const STORAGE_PREFIX = 'docs-checklist:';
const LIST_ID_PREFIX = 'list';
const NESTED_LIST_SUFFIX = 'l';
const STRIP_P_RE = /^<p>|<\/p>\n?$/g;
const ANCHOR_TAG = 'A';
const EMPTY_ANCESTORS: ChecklistItem[] = [];

const COPY = {
  RESET: 'Reset',
  CHECKED_SUFFIX: 'checked',
} as const;

const CLS = {
  ROOT: 'w-full',
  PROSE: 'prose dark:prose-invert max-w-none px-4 sm:px-6 py-4',
  HEADER:
    'flex items-center gap-1 not-prose mb-4 pb-2 border-b border-gray-200 dark:border-gray-700',
  HEADER_TEXT: 'text-sm text-gray-600 dark:text-gray-400',
  RESET_BTN:
    'text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
  BLOCK: 'contents',
  LIST: 'not-prose pl-0',
  NESTED_LIST: 'ml-6 border-l border-gray-200 dark:border-gray-700 pl-3',
  ROW_LABEL: 'flex items-start gap-2 py-1 cursor-pointer group',
  CHECKBOX: 'mt-1.5 h-4 w-4 shrink-0 cursor-pointer',
  ROW_TEXT: 'flex-1 leading-6',
  ROW_TEXT_DONE: 'line-through text-gray-400 dark:text-gray-500',
} as const;

interface ChecklistViewerProps {
  content: string;
  filePath: string;
  onNavigate?: (path: string) => void;
}

interface ChecklistItem {
  id: string;
  html: string;
  children: ChecklistItem[];
}

type ContentBlock =
  { kind: 'html'; html: string } | { kind: 'list'; items: ChecklistItem[] };

const inlineHtml = (tokens: Tokens.Generic[], opts: MarkedOptions): string =>
  marked
    .parser([{ type: 'paragraph', raw: '', tokens } as Tokens.Paragraph], opts)
    .replace(STRIP_P_RE, '');

const buildItems = (
  listItems: Tokens.ListItem[],
  idPrefix: string,
  opts: MarkedOptions,
): ChecklistItem[] =>
  listItems.map((item, index) => {
    const id = `${idPrefix}.${index}`;
    let html = '';
    const children: ChecklistItem[] = [];
    for (const token of item.tokens) {
      if (token.type === 'list') {
        children.push(
          ...buildItems(
            (token as Tokens.List).items,
            `${id}.${NESTED_LIST_SUFFIX}`,
            opts,
          ),
        );
      } else if (token.type === 'text') {
        html += inlineHtml((token as Tokens.Text).tokens ?? [], opts);
      } else {
        html += marked.parser([token], opts);
      }
    }
    return { id, html, children };
  });

const TOC_HEADING_RE = /^(table of contents|contents|toc)$/i;
const IN_PAGE_LINK_RE = /^\[[^\]]*\]\(#[^)]*\)$/;

// A list is a table of contents when every item, at every depth, is just a
// link to an anchor on the page.
const isAnchorOnlyList = (list: Tokens.List): boolean =>
  list.items.every(item =>
    item.tokens.every(token =>
      token.type === 'list'
        ? isAnchorOnlyList(token as Tokens.List)
        : token.type === 'space' || IN_PAGE_LINK_RE.test(token.raw.trim()),
    ),
  );

// Only top-level lists become checkboxes; everything else renders as normal
// markdown, including a table of contents: the list under a "Table of
// Contents" heading, or one made only of in-page links.
const parseContent = (content: string): ContentBlock[] => {
  // marked.parser()'s options replace marked.defaults entirely rather than merging with it,
  // and a fresh renderer per call keeps heading-id dedup state isolated per parse (see
  // markdown-config.ts's createHeadingRenderer for why that isolation matters).
  const opts: MarkedOptions = {
    ...marked.defaults,
    renderer: createHeadingRenderer(),
    async: false,
  };
  const tokens = marked.lexer(content);
  let listIndex = 0;
  let previousHeading: string | null = null;

  return tokens.map(token => {
    if (token.type === 'list') {
      // A table of contents still takes its list number, so lists after it
      // keep the ids their saved checks are stored under.
      const idPrefix = `${LIST_ID_PREFIX}${listIndex++}`;
      const list = token as Tokens.List;
      const isToc =
        (previousHeading !== null && TOC_HEADING_RE.test(previousHeading)) ||
        isAnchorOnlyList(list);
      previousHeading = null;
      if (isToc) return { kind: 'html', html: marked.parser([token], opts) };
      return {
        kind: 'list',
        items: buildItems(list.items, idPrefix, opts),
      };
    }
    if (token.type === 'heading')
      previousHeading = (token as Tokens.Heading).text.trim();
    else if (token.type !== 'space') previousHeading = null;
    return { kind: 'html', html: marked.parser([token], opts) };
  });
};

const collectIds = (items: ChecklistItem[], out: string[] = []): string[] => {
  for (const item of items) {
    out.push(item.id);
    collectIds(item.children, out);
  }
  return out;
};

const storageKey = (filePath: string) => `${STORAGE_PREFIX}${filePath}`;

const loadChecked = (filePath: string): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const raw = window.localStorage.getItem(storageKey(filePath));
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const saveChecked = (filePath: string, checked: Set<string>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    storageKey(filePath),
    JSON.stringify(Array.from(checked)),
  );
};

// Checking an item sets everything nested under it to the same state, then
// each ancestor, nearest first, is checked exactly when all its children are,
// so unchecking one sub-step also unchecks the items above it.
const applyToggle = (
  prev: Set<string>,
  item: ChecklistItem,
  ancestors: ChecklistItem[],
): Set<string> => {
  const next = new Set(prev);
  const value = !prev.has(item.id);
  for (const id of collectIds([item])) {
    if (value) next.add(id);
    else next.delete(id);
  }
  for (const ancestor of [...ancestors].reverse()) {
    if (ancestor.children.every(child => next.has(child.id)))
      next.add(ancestor.id);
    else next.delete(ancestor.id);
  }
  return next;
};

interface ItemRowProps {
  item: ChecklistItem;
  ancestors: ChecklistItem[];
  checked: Set<string>;
  toggle: (item: ChecklistItem, ancestors: ChecklistItem[]) => void;
  filePath: string;
  onNavigate?: (path: string) => void;
}

const ItemRow = ({
  item,
  ancestors,
  checked,
  toggle,
  filePath,
  onNavigate,
}: ItemRowProps) => {
  const isChecked = checked.has(item.id);
  const isPartial =
    !isChecked && collectIds(item.children).some(id => checked.has(id));
  const handleLinkClick = createNoteLinkClickHandler(filePath, onNavigate);
  const childAncestors = [...ancestors, item];
  return (
    <li className="list-none">
      <label className={CLS.ROW_LABEL}>
        <input
          type="checkbox"
          checked={isChecked}
          // `indeterminate` has no attribute form, so it is set on the node.
          ref={el => {
            if (el) el.indeterminate = isPartial;
          }}
          onChange={() => toggle(item, ancestors)}
          className={CLS.CHECKBOX}
        />
        <span
          className={`${CLS.ROW_TEXT} ${isChecked ? CLS.ROW_TEXT_DONE : ''}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.html) }}
          onClickCapture={e => {
            if ((e.target as HTMLElement).tagName === ANCHOR_TAG) {
              e.stopPropagation();
              handleLinkClick(e);
            }
          }}
        />
      </label>
      {item.children.length > 0 && (
        <ul className={CLS.NESTED_LIST}>
          {item.children.map(child => (
            <ItemRow
              key={child.id}
              item={child}
              ancestors={childAncestors}
              checked={checked}
              toggle={toggle}
              filePath={filePath}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export function ChecklistViewer({
  content,
  filePath,
  onNavigate,
}: ChecklistViewerProps) {
  const blocks = useMemo(() => parseContent(content), [content]);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setChecked(loadChecked(filePath));
  }, [filePath]);

  const proseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = proseRef.current;
    renderMermaidDiagrams(el).then(scrollToUrlHash);
    return el
      ? observeThemeChange(el, () => renderMermaidDiagrams(el))
      : undefined;
  }, [blocks]);

  const toggle = (item: ChecklistItem, ancestors: ChecklistItem[]) => {
    setChecked(prev => {
      const next = applyToggle(prev, item, ancestors);
      saveChecked(filePath, next);
      return next;
    });
  };

  const reset = () => {
    const empty = new Set<string>();
    setChecked(empty);
    saveChecked(filePath, empty);
  };

  const allIds = useMemo(
    () =>
      collectIds(
        blocks
          .filter(
            (b): b is Extract<ContentBlock, { kind: 'list' }> =>
              b.kind === 'list',
          )
          .flatMap(b => b.items),
      ),
    [blocks],
  );
  const total = allIds.length;
  const done = allIds.filter(id => checked.has(id)).length;

  const handleContentClick = createNoteLinkClickHandler(filePath, onNavigate);

  return (
    <div className={CLS.ROOT}>
      <div ref={proseRef} className={CLS.PROSE} onClick={handleContentClick}>
        {total > 0 && (
          <div className={CLS.HEADER}>
            <span className={CLS.HEADER_TEXT}>
              {done} / {total} {COPY.CHECKED_SUFFIX}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button type="button" onClick={reset} className={CLS.RESET_BTN}>
              {COPY.RESET}
            </button>
          </div>
        )}

        {blocks.map((block, index) =>
          block.kind === 'list' ? (
            <ul key={index} className={CLS.LIST}>
              {block.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  ancestors={EMPTY_ANCESTORS}
                  checked={checked}
                  toggle={toggle}
                  filePath={filePath}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          ) : (
            <div
              key={index}
              className={CLS.BLOCK}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(block.html),
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
