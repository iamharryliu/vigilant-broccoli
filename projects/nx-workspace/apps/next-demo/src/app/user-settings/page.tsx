'use client';

import { useState } from 'react';
import { Text, TextField } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { supabase } from '../../../libs/supabase';

export default function UserSettingsPage() {
  const session = useAuth();
  const [displayName, setDisplayName] = useState(
    (session?.user.user_metadata?.display_name as string) ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    await fetch('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ displayName }),
    });
    await supabase.auth.refreshSession();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Text size="6" weight="bold">
        User Settings
      </Text>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Account
        </Text>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              Email
            </Text>
            <Text size="2">{session?.user.email ?? '—'}</Text>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              User ID
            </Text>
            <Text size="2" className="font-mono text-xs">
              {session?.user.id ?? '—'}
            </Text>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Profile
        </Text>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            <Text size="2" color="gray" className="shrink-0">
              Display Name
            </Text>
            <div className="flex items-center gap-2">
              <TextField.Root
                size="2"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
              <Button
                onClick={handleSave}
                disabled={saving || !displayName.trim()}
                className="cursor-pointer"
              >
                {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
