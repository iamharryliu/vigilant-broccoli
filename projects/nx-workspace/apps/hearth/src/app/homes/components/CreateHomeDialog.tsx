'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../../libs/supabase';
import { useAuth } from '../../providers/auth-provider';
import { useHome } from '../../providers/home-provider';
import { HomeForm } from './HomeForm';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateHomeDialog = ({ open, onOpenChange }: Props) => {
  const session = useAuth();
  const { refreshHomes, setSelectedHomeId } = useHome();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !session?.user.id) return;
    setSaving(true);
    const { data } = await supabase
      .from('homes')
      .insert({
        name: name.trim(),
        description,
        user_id: session.user.id,
      })
      .select('id')
      .single();
    await refreshHomes();
    if (data?.id) setSelectedHomeId(data.id);
    setSaving(false);
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          Add Home
        </DialogTitle>
        <DialogDescription className="text-base">
          Create a new home and switch to it.
        </DialogDescription>
        <div className="mt-3">
          <HomeForm
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onSave={handleCreate}
            saveLabel="Create"
            saving={saving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
