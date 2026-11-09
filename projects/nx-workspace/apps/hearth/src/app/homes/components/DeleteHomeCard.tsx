'use client';

import { Trash2 } from 'lucide-react';
import { Button, Text } from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../../libs/supabase';
import { useHome } from '../../providers/home-provider';

type Props = {
  homeId: number;
  onDeleted?: () => void;
};

const CONFIRM_DELETE_HOME =
  'Delete this home? Everything stored under it is removed too.';

export const DeleteHomeCard = ({ homeId, onDeleted }: Props) => {
  const { refreshHomes } = useHome();

  const handleDelete = async () => {
    if (!window.confirm(CONFIRM_DELETE_HOME)) return;
    await supabase.from('homes').delete().eq('id', homeId);
    await refreshHomes();
    onDeleted?.();
  };

  return (
    <div className="border border-red-300 dark:border-red-900 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <div>
        <Text size="2" weight="medium" as="p">
          Delete this home
        </Text>
        <Text size="1" color="gray">
          Permanently removes this home and everything stored under it,
          including its members. This cannot be undone.
        </Text>
      </div>
      <Button variant="destructive" onClick={handleDelete} className="shrink-0">
        <Trash2 size={14} /> Delete home
      </Button>
    </div>
  );
};
