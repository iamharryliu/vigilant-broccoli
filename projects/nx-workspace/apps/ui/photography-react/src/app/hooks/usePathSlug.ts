import { useCallback, useEffect, useState } from 'react';

const LEGACY_HASH_ROUTE = /^#\/(.*)$/;
const EVENT_POPSTATE = 'popstate';

const readSlug = () =>
  decodeURIComponent(window.location.pathname.replace(/^\/|\/$/g, ''));

// Keeps the query (e.g. dev `?mock`) across in-app navigation.
export const toAppHref = (path: string) => `${path}${window.location.search}`;

export const albumPath = (slug: string) => `/${encodeURIComponent(slug)}`;

export const HOME_PATH = '/';

// Path routes rely on Cloudflare Pages serving index.html for unknown paths,
// which it does for a project without a 404.html (Vite's dev server too).
export const usePathSlug = () => {
  const [slug, setSlug] = useState(() => {
    // Links shared before path routing used `#/<slug>`.
    const legacy = LEGACY_HASH_ROUTE.exec(window.location.hash);
    if (legacy)
      window.history.replaceState(null, '', toAppHref(`/${legacy[1]}`));
    return readSlug();
  });

  useEffect(() => {
    const onPopState = () => setSlug(readSlug());
    window.addEventListener(EVENT_POPSTATE, onPopState);
    return () => window.removeEventListener(EVENT_POPSTATE, onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', toAppHref(path));
    window.scrollTo(0, 0);
    setSlug(readSlug());
  }, []);

  return { slug, navigate };
};
