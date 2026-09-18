import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  ImageCarouselDialog,
  Text,
  buttonVariants,
} from '@vigilant-broccoli/react-lib';
import { MarkdownViewer } from '@vigilant-broccoli/react-utility';
import checklistScreenshot from '../assets/docs-explorer/checklist.webp';
import graphScreenshot from '../assets/docs-explorer/graph.webp';
import searchScreenshot from '../assets/docs-explorer/search.webp';
import treeScreenshot from '../assets/docs-explorer/tree.webp';

const DOCS_URL = 'https://docs.harryliu.dev/';
const README_PATH =
  'projects/nx-workspace/libs/@vigilant-broccoli/react-lib/docs/features/docs-explorer.md';
const README_URL = `https://raw.githubusercontent.com/iamharryliu/vigilant-broccoli/main/${README_PATH}`;
const REPO_BLOB_URL =
  'https://github.com/iamharryliu/vigilant-broccoli/blob/main/';

const COPY = {
  INTRO:
    'The docs explorer is the file-tree + search shell behind docs.harryliu.dev. It is not mounted here - it needs a notes tree to browse - so this page links to the live site and shows what it looks like there.',
  VISIT: 'Open docs.harryliu.dev',
  SCREENSHOTS: 'Screenshots',
  SCREENSHOTS_HINT:
    'Captured from the live site - click one to open it full screen.',
  README: 'Feature doc',
  LOADING: 'Loading feature doc...',
  ERROR: 'Failed to load feature doc',
  ALT: 'Docs explorer screenshot',
} as const;

const SCREENSHOTS = [
  { src: treeScreenshot, caption: 'File tree with the selected note rendered' },
  {
    src: searchScreenshot,
    caption: 'Debounced search across filenames and content',
  },
  {
    src: checklistScreenshot,
    caption: 'Checklist view with per-file checkbox state',
  },
  { src: graphScreenshot, caption: 'Note graph in global scope' },
];

const CARD_CLASS =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden';
const THUMBNAIL_CLASS =
  'block w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors';
const STATUS_CLASS = 'px-4 sm:px-6 py-4 text-sm';

export const DocsExplorerDemo = () => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(README_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        if (!cancelled) setContent(text);
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      <Text size="2" color="gray">
        {COPY.INTRO}
      </Text>

      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonVariants()} self-start`}
      >
        {COPY.VISIT}
        <ExternalLink className="h-4 w-4" />
      </a>

      <div className="flex flex-col gap-3">
        <Text size="3" weight="medium">
          {COPY.SCREENSHOTS}
        </Text>
        <Text size="2" color="gray">
          {COPY.SCREENSHOTS_HINT}
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          {SCREENSHOTS.map((screenshot, index) => (
            <figure key={screenshot.src} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCarouselIndex(index)}
                className={THUMBNAIL_CLASS}
              >
                <img
                  src={screenshot.src}
                  alt={`${COPY.ALT} - ${screenshot.caption}`}
                  className="w-full"
                />
              </button>
              <figcaption>
                <Text size="1" color="gray">
                  {screenshot.caption}
                </Text>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <ImageCarouselDialog
        images={SCREENSHOTS.map(screenshot => screenshot.src)}
        initialIndex={carouselIndex ?? 0}
        open={carouselIndex !== null}
        onOpenChange={open => setCarouselIndex(open ? carouselIndex : null)}
        alt={COPY.ALT}
      />

      <div className="flex flex-col gap-3">
        <Text size="3" weight="medium">
          {COPY.README}
        </Text>
        <div className={CARD_CLASS}>
          {error && (
            <p className={`${STATUS_CLASS} text-red-500`}>
              {COPY.ERROR}: {error}
            </p>
          )}
          {!error && content === null && (
            <p className={`${STATUS_CLASS} text-gray-400`}>{COPY.LOADING}</p>
          )}
          {!error && content && (
            <MarkdownViewer
              content={content}
              filePath={README_PATH}
              onNavigate={path =>
                window.open(`${REPO_BLOB_URL}${path}`, '_blank', 'noopener')
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
