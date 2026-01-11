'use client';

import { useState, useEffect, ReactNode } from 'react';
import { CollapsibleListItem } from './collapsible-list-item.component';

export interface CollapsibleListItemConfig {
  id: string;
  title?: string;
  titleContent?: ReactNode;
  headerAction?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface CollapsibleListProps {
  items: CollapsibleListItemConfig[];
  storageKeyPrefix?: string;
  showBorders?: boolean;
}

export const CollapsibleList = ({
  items,
  storageKeyPrefix,
  showBorders = true,
}: CollapsibleListProps) => {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    items.forEach(item => {
      initialState[item.id] = item.defaultOpen ?? false;
    });
    return initialState;
  });

  useEffect(() => {
    if (!storageKeyPrefix) return;

    const loadedStates: Record<string, boolean> = {};
    items.forEach(item => {
      const saved = localStorage.getItem(`${storageKeyPrefix}-${item.id}`);
      if (saved !== null) {
        loadedStates[item.id] = saved === 'true';
      } else {
        loadedStates[item.id] = item.defaultOpen ?? false;
      }
    });
    setOpenStates(loadedStates);
  }, [storageKeyPrefix, items]);

  const toggleItem = (id: string) => {
    setOpenStates(prev => {
      const newState = { ...prev, [id]: !prev[id] };

      if (storageKeyPrefix) {
        localStorage.setItem(`${storageKeyPrefix}-${id}`, String(newState[id]));
      }

      return newState;
    });
  };

  return (
    <>
      {items.map((item) => (
        <CollapsibleListItem
          key={item.id}
          title={item.title}
          titleContent={item.titleContent}
          isOpen={openStates[item.id] ?? false}
          setIsOpen={() => toggleItem(item.id)}
          showBorder={showBorders}
          headerAction={item.headerAction}
        >
          {item.content}
        </CollapsibleListItem>
      ))}
    </>
  );
};
