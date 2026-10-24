import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UNREAD_PREFIX = /^\(\d+\)\s*/;

export function useUnreadDocumentTitle(unreadCount: number) {
  const { pathname } = useLocation();

  useEffect(() => {
    const baseTitle = document.title.replace(UNREAD_PREFIX, '');
    document.title =
      unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
  }, [unreadCount, pathname]);
}
