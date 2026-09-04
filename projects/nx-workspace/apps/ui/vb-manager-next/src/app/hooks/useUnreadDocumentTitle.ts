'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const UNREAD_PREFIX = /^\(\d+\)\s*/;

export function useUnreadDocumentTitle(unreadCount: number) {
  const pathname = usePathname();

  useEffect(() => {
    const baseTitle = document.title.replace(UNREAD_PREFIX, '');
    document.title =
      unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
  }, [unreadCount, pathname]);
}
