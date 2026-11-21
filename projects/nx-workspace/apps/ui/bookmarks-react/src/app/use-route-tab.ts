import { useEffect, useState } from 'react';

export const TAB = {
  BOOKMARKS: 'bookmarks',
  MANAGE: 'manage',
  SETTINGS: 'settings',
} as const;
export type Tab = (typeof TAB)[keyof typeof TAB];

// BASE_URL keeps previews served from a sub-path working; it always ends with "/".
const BASE_PATH = import.meta.env.BASE_URL;
export const TAB_PATH = {
  [TAB.BOOKMARKS]: BASE_PATH,
  [TAB.MANAGE]: `${BASE_PATH}manage`,
  [TAB.SETTINGS]: `${BASE_PATH}settings`,
} as const;
const trimSlash = (path: string) => path.replace(/\/+$/, '');

const tabFromPath = (pathname: string): Tab =>
  Object.values(TAB).find(
    tab => trimSlash(pathname) === trimSlash(TAB_PATH[tab]),
  ) ?? TAB.BOOKMARKS;

export function useRouteTab() {
  const [tab, setTabState] = useState(() =>
    tabFromPath(window.location.pathname),
  );
  useEffect(() => {
    const onPopState = () => setTabState(tabFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const setTab = (next: Tab) => {
    if (next !== tab) window.history.pushState(null, '', TAB_PATH[next]);
    setTabState(next);
  };
  return { tab, setTab };
}
