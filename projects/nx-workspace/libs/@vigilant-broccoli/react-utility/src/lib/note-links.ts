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

  const [rawPath, hash] = href.split('#');
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

  const resolvedPath = resolved.join(PATH_SEP);
  return hash ? `${resolvedPath}#${hash}` : resolvedPath;
};

// The browser's native scroll-to-fragment only fires around the initial page load; by the
// time async-fetched content renders its headings, that window has already closed.
export const scrollToUrlHash = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
};

// In-page heading anchors (e.g. a Table of Contents link to "#stack") must not fall through
// to the browser default: under HashRouter the URL's fragment IS the route, so letting the
// browser navigate to "#stack" replaces the current route hash instead of scrolling.
const isInPageAnchor = (href: string): boolean => href.startsWith('#');

// history.replaceState (not `location.hash =`) so the fragment lands in the address bar
// without the browser's native instant scroll-to-fragment fighting the smooth scroll below,
// and without emitting a hashchange a HashRouter consumer would otherwise react to.
const setUrlHash = (id: string) => {
  const { pathname, search } = window.location;
  window.history.replaceState(
    window.history.state,
    '',
    `${pathname}${search}#${id}`,
  );
};

export const createNoteLinkClickHandler =
  (filePath: string, onNavigate?: (path: string) => void) =>
  (event: MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (isInPageAnchor(href)) {
      event.preventDefault();
      const id = href.slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      // Only apps that route via a `?file=` query param (DocsExplorer, signalled by
      // onNavigate being passed) are safe to mirror the anchor into the URL — a bare
      // HashRouter consumer (no onNavigate, e.g. pages-index's ReadmePage) uses the
      // fragment as its route, so touching it there would still be wrong.
      if (onNavigate) setUrlHash(id);
      return;
    }

    if (!onNavigate) return;
    const target = resolveNoteLink(filePath, href);
    if (target === null) return;
    event.preventDefault();
    onNavigate(target);
  };
