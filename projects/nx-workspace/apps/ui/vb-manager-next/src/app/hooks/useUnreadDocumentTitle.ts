'use client';

import { useEffect, useRef } from 'react';

export function useUnreadDocumentTitle(unreadCount: number) {
  const baseTitle = useRef<string>('');

  useEffect(() => {
    if (!baseTitle.current) {
      baseTitle.current = document.title.replace(/^\(\d+\)\s*/, '');
    }
    document.title =
      unreadCount > 0
        ? `(${unreadCount}) ${baseTitle.current}`
        : baseTitle.current;
  }, [unreadCount]);
}
