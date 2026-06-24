import { useEffect, useMemo, useState, type JSX } from 'react';
import { marked, Tokens } from 'marked';

const STORAGE_PREFIX = 'docs-checklist:';
const INTRO_PREFIX = 'intro';
const SECTION_PREFIX = 's';
const NESTED_LIST_SUFFIX = 'l';
const PARSER_OPTS = { async: false } as const;
const STRIP_P_RE = /^<p>|<\/p>\n?$/g;
const ANCHOR_TAG = 'A';

const COPY = {
  RESET: 'Reset',
  CHECKED_SUFFIX: 'checked',
  EMPTY: 'No list items found in this file.',
} as const;

const CLS = {
  ROOT: 'w-full h-full overflow-auto',
  PROSE: 'prose dark:prose-invert max-w-none px-6 py-4',
  HEADER:
    'flex items-center gap-1 not-prose mb-4 pb-2 border-b border-gray-200 dark:border-gray-700',
  HEADER_TEXT: 'text-sm text-gray-600 dark:text-gray-400',
  RESET_BTN:
    'text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
  LIST: 'not-prose pl-0',
  NESTED_LIST: 'ml-6 border-l border-gray-200 dark:border-gray-700 pl-3',
  ROW_LABEL: 'flex items-start gap-2 py-1 cursor-pointer group',
  CHECKBOX: 'mt-1.5 h-4 w-4 shrink-0 cursor-pointer',
  ROW_TEXT: 'flex-1 leading-6',
  ROW_TEXT_DONE: 'line-through text-gray-400 dark:text-gray-500',
  SECTION_HEADER: 'flex items-baseline justify-between gap-2 mt-6',
  SECTION_COUNT: 'text-xs text-gray-500 dark:text-gray-400 not-prose',
  EMPTY: 'text-gray-500',
} as const;

interface ChecklistViewerProps {
  content: string;
  filePath: string;
}

interface ChecklistItem {
  id: string;
  html: string;
  children: ChecklistItem[];
}

interface ChecklistSection {
  id: string;
  headingHtml: string;
  headingLevel: number;
  items: ChecklistItem[];
}

interface ParsedChecklist {
  intro: ChecklistItem[];
  sections: ChecklistSection[];
}

const inlineHtml = (tokens: Tokens.Generic[]): string =>
  marked
    .parser(
      [{ type: 'paragraph', raw: '', tokens } as Tokens.Paragraph],
      PARSER_OPTS,
    )
    .replace(STRIP_P_RE, '');

const buildItems = (
  listItems: Tokens.ListItem[],
  idPrefix: string,
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
          ),
        );
      } else if (token.type === 'text') {
        html += inlineHtml((token as Tokens.Text).tokens ?? []);
      } else {
        html += marked.parser([token], PARSER_OPTS);
      }
    }
    return { id, html, children };
  });

const parseContent = (content: string): ParsedChecklist => {
  const tokens = marked.lexer(content);
  const sections: ChecklistSection[] = [];
  const intro: ChecklistItem[] = [];
  let currentSection: ChecklistSection | null = null;
  let sectionIndex = 0;

  for (const token of tokens) {
    if (token.type === 'heading') {
      const heading = token as Tokens.Heading;
      currentSection = {
        id: `${SECTION_PREFIX}${sectionIndex++}`,
        headingHtml: inlineHtml(heading.tokens ?? []),
        headingLevel: heading.depth,
        items: [],
      };
      sections.push(currentSection);
    } else if (token.type === 'list') {
      const target = currentSection ? currentSection.items : intro;
      const prefix = currentSection ? currentSection.id : INTRO_PREFIX;
      target.push(
        ...buildItems(
          (token as Tokens.List).items,
          `${prefix}.${target.length}`,
        ),
      );
    }
  }

  return { intro, sections };
};

const collectIds = (items: ChecklistItem[], out: string[] = []): string[] => {
  for (const item of items) {
    out.push(item.id);
    collectIds(item.children, out);
  }
  return out;
};

const countProgress = (
  items: ChecklistItem[],
  checked: Set<string>,
): [number, number] => {
  const ids = collectIds(items);
  return [ids.filter(id => checked.has(id)).length, ids.length];
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

interface ItemRowProps {
  item: ChecklistItem;
  checked: Set<string>;
  toggle: (id: string) => void;
}

const ItemRow = ({ item, checked, toggle }: ItemRowProps) => {
  const isChecked = checked.has(item.id);
  return (
    <li className="list-none">
      <label className={CLS.ROW_LABEL}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggle(item.id)}
          className={CLS.CHECKBOX}
        />
        <span
          className={`${CLS.ROW_TEXT} ${isChecked ? CLS.ROW_TEXT_DONE : ''}`}
          dangerouslySetInnerHTML={{ __html: item.html }}
          onClickCapture={e => {
            if ((e.target as HTMLElement).tagName === ANCHOR_TAG) {
              e.stopPropagation();
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
              checked={checked}
              toggle={toggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export function ChecklistViewer({ content, filePath }: ChecklistViewerProps) {
  const parsed = useMemo(() => parseContent(content), [content]);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setChecked(loadChecked(filePath));
  }, [filePath]);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(filePath, next);
      return next;
    });
  };

  const reset = () => {
    const empty = new Set<string>();
    setChecked(empty);
    saveChecked(filePath, empty);
  };

  const allItems = useMemo(
    () => [...parsed.intro, ...parsed.sections.flatMap(s => s.items)],
    [parsed],
  );
  const [done, total] = countProgress(allItems, checked);
  const hasContent = total > 0;

  return (
    <div className={CLS.ROOT}>
      <div className={CLS.PROSE}>
        {hasContent && (
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

        {parsed.intro.length > 0 && (
          <ul className={CLS.LIST}>
            {parsed.intro.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                checked={checked}
                toggle={toggle}
              />
            ))}
          </ul>
        )}

        {parsed.sections.map(section => {
          const [sDone, sTotal] = countProgress(section.items, checked);
          const HeadingTag =
            `h${section.headingLevel}` as keyof JSX.IntrinsicElements;
          return (
            <section key={section.id}>
              <div className={CLS.SECTION_HEADER}>
                <HeadingTag
                  className="m-0"
                  dangerouslySetInnerHTML={{ __html: section.headingHtml }}
                />
                {sTotal > 0 && (
                  <span className={CLS.SECTION_COUNT}>
                    {sDone}/{sTotal}
                  </span>
                )}
              </div>
              {section.items.length > 0 && (
                <ul className={CLS.LIST}>
                  {section.items.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      checked={checked}
                      toggle={toggle}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {!hasContent && <p className={CLS.EMPTY}>{COPY.EMPTY}</p>}
      </div>
    </div>
  );
}
