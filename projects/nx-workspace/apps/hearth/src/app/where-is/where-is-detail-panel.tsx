'use client';

import { useEffect, useState } from 'react';
import { WhereIsItem } from '../../lib/types';
import { SlideOverPanel } from '../components/SlideOverPanel';
import { WhereIsDetail } from './where-is-detail';

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

  return (
    <SlideOverPanel open={open} onClose={onClose} className="overflow-y-auto">
      {renderedId && (
        <WhereIsDetail
          id={renderedId}
          variant="panel"
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(renderedId)}
        />
      )}
    </SlideOverPanel>
  );
};
