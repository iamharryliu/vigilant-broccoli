import { useEffect, useState } from 'react';

const HASH_PREFIX = /^#\/?/;

const readSlug = () =>
  decodeURIComponent(window.location.hash.replace(HASH_PREFIX, ''));

// A hash route keeps deep links working on a static host with no rewrite rules.
export const useHashSlug = () => {
  const [slug, setSlug] = useState(readSlug);

  useEffect(() => {
    const onHashChange = () => setSlug(readSlug());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return slug;
};
