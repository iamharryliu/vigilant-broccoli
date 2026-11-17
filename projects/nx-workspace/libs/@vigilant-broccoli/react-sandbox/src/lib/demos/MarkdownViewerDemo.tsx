import { useState } from 'react';
import { MarkdownViewer } from '@vigilant-broccoli/docs-explorer';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';

const SAMPLE = `# Markdown sampler

Intro prose stays above the collapsible sections. It has **bold**, *italic*, ~~strikethrough~~, \`inline code\` and a [link](https://harryliu.dev).

## Text and lists

### Unordered and ordered

- First item
  - Nested item
- Second item

1. Step one
2. Step two
3. Step three

### Task list

- [x] Done
- [ ] Not yet

> A blockquote with a second line
> that wraps onto it.

## Table

| Component | Lib | Collapsible |
| --- | --- | --- |
| CollapsibleList | react-lib | yes |
| MarkdownViewer | docs-explorer | opt-in |

## Code

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}\`;
\`\`\`

\`\`\`bash
# a comment inside a fence is not a section
echo hi
\`\`\`

## Diagram

\`\`\`mermaid
flowchart LR
  A[Markdown] --> B[Split by heading]
  B --> C[CollapsibleList]
\`\`\`

## Rules and HTML

---

Raw HTML is sanitized: <mark>highlighted</mark> text survives, <script>alert(1)</script> does not.

## Closing

- Oldest change.
`;

const COLLAPSIBLE_HEADING_LEVEL = 2;
const DEFAULT_OPEN_SECTIONS = 1;
const TAB = { RENDERED: 'rendered', CUSTOM: 'custom' } as const;
const NO_COLLAPSE = 0;
const HEADING_LEVELS = [NO_COLLAPSE, 1, 2, 3, 4, 5, 6];

const FIELD_CLS =
  'rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900';

export const MarkdownViewerDemo = () => {
  const [content, setContent] = useState(SAMPLE);
  const [level, setLevel] = useState(COLLAPSIBLE_HEADING_LEVEL);
  const [openCount, setOpenCount] = useState(DEFAULT_OPEN_SECTIONS);

  return (
    <Tabs defaultValue={TAB.RENDERED}>
      <TabsList>
        <TabsTrigger value={TAB.RENDERED}>Rendered</TabsTrigger>
        <TabsTrigger value={TAB.CUSTOM}>Custom text</TabsTrigger>
      </TabsList>
      <TabsContent value={TAB.RENDERED}>
        <div className="rounded border border-gray-200 dark:border-gray-700">
          <MarkdownViewer
            // Remount so the default-open sections re-apply after a setting change.
            key={`${level}-${openCount}`}
            content={content}
            collapsibleHeadingLevel={level || undefined}
            defaultOpenSections={openCount}
          />
        </div>
      </TabsContent>
      <TabsContent value={TAB.CUSTOM}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              Collapsible heading level
              <select
                className={FIELD_CLS}
                value={level}
                onChange={e => setLevel(Number(e.target.value))}
              >
                {HEADING_LEVELS.map(value => (
                  <option key={value} value={value}>
                    {value === NO_COLLAPSE ? 'Off' : `H${value}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Sections open by default
              <input
                type="number"
                min={0}
                className={`${FIELD_CLS} w-20`}
                value={openCount}
                onChange={e =>
                  setOpenCount(Math.max(0, Number(e.target.value)))
                }
              />
            </label>
          </div>
          <textarea
            className={`${FIELD_CLS} h-72 w-full font-mono`}
            value={content}
            onChange={e => setContent(e.target.value)}
            spellCheck={false}
            aria-label="Markdown input"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
