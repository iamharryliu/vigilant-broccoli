'use client';

import { useState } from 'react';
import { Text } from '@radix-ui/themes';
import { HomeForm } from './HomeForm';

type Props = {
  onSubmit: (name: string, description: string) => Promise<void>;
};

export const HomeCreateForm = ({ onSubmit }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit(name, description);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Text size="6" weight="bold">
        Create Your Home
      </Text>
      <HomeForm
        name={name}
        description={description}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
};
