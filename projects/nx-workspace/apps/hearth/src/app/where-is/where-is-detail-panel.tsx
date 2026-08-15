'use client';

import { useEffect, useState } from 'react';
import { cn } from '@vigilant-broccoli/react-lib';
import { WhereIsItem } from '../../lib/types';
import { WhereIsDetail } from './where-is-detail';

const PANEL_BASE =
  'fixed inset-y-0 right-0 z-40 w-full sm:w-[28rem] max-w-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-y-auto p-6 transition-transform duration-300 ease-in-out';
const PANEL_OPEN = 'translate-x-0';
const PANEL_CLOSED = 'translate-x-full';

type Props = {
  itemId: string | null;
  onClose: () => void;
  onUpdated: (item: WhereIsItem) => void;
  onDeleted: (id: string) => void;
};

export const WhereIsDetailPanel = ({
  itemId,
  onClose,
  onUpdated,
  onDeleted,
}: Props) => {
  const open = itemId !== null;
  const [renderedId, setRenderedId] = useState(itemId);

  useEffect(() => {
    if (itemId) setRenderedId(itemId);
  }, [itemId]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div className={cn(PANEL_BASE, open ? PANEL_OPEN : PANEL_CLOSED)}>
      {renderedId && (
        <WhereIsDetail
          id={renderedId}
          variant="panel"
          onClose={onClose}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(renderedId)}
        />
      )}
    </div>
  );
};
