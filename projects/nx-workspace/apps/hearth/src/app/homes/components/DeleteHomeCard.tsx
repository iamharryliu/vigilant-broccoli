'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  DangerCard,
  DeleteItemConfirmationDialog,
} from '@vigilant-broccoli/react-lib';
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
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    await supabase.from('homes').delete().eq('id', homeId);
    await refreshHomes();
    onDeleted?.();
  };

  return (
    <DangerCard
      title="Delete this home"
      description="Permanently removes this home and everything stored under it, including its members. This cannot be undone."
      actionLabel="Delete home"
      actionIcon={<Trash2 size={14} />}
      onAction={() => setIsConfirming(true)}
    >
      <DeleteItemConfirmationDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title="Delete home"
        description={CONFIRM_DELETE_HOME}
        deleteItem={handleDelete}
      />
    </DangerCard>
  );
};
