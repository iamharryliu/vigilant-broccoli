import type { MouseEvent } from 'react';

const EXTERNAL_OR_HASH_HREF_RE = /^([a-z][a-z0-9+.-]*:|#)/i;
const PATH_SEP = '/';
const CURRENT_SEGMENT = '.';
const PARENT_SEGMENT = '..';

export const resolveNoteLink = (
  fromPath: string,
  href: string,
): string | null => {
  if (!href || EXTERNAL_OR_HASH_HREF_RE.test(href)) return null;

  const rawPath = href.split('#')[0];
  if (!rawPath) return null;

  const segments = [
    ...fromPath.split(PATH_SEP).slice(0, -1),
    ...rawPath.split(PATH_SEP),
  ];

  const resolved: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === CURRENT_SEGMENT) continue;
    if (segment === PARENT_SEGMENT) resolved.pop();
    else resolved.push(segment);
  }

  return resolved.join(PATH_SEP);
};

// The browser's native scroll-to-fragment only fires around the initial page load; by the
// time async-fetched content renders its headings, that window has already closed.
export const scrollToUrlHash = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  document.getElementById(hash)?.scrollIntoView();
};

export const createNoteLinkClickHandler =
  (filePath: string, onNavigate?: (path: string) => void) =>
  (event: MouseEvent<HTMLElement>) => {
    if (!onNavigate) return;
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;
    const target = resolveNoteLink(filePath, href);
    if (target === null) return;
    event.preventDefault();
    onNavigate(target);
  };
