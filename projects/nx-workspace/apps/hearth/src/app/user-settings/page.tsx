'use client';

import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

import { Button, Input, Text } from '@vigilant-broccoli/react-lib';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { supabase } from '../../../libs/supabase';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import { Home } from '../../lib/types';

const USER_API = '/api/user';

const CONFIRM_DELETE =
  'Delete this home? Everything stored under it is removed too.';

const HomeRow = ({
  home,
  isSelected,
  onSelect,
  onSave,
  onDelete,
}: {
  home: Home;
  isSelected: boolean;
  onSelect: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) => {
  const [name, setName] = useState(home.name);
  const [description, setDescription] = useState(home.description ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = name !== home.name || description !== (home.description ?? '');

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onSelect}
          disabled={isSelected}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs cursor-pointer disabled:cursor-default ${
            isSelected
              ? 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500'
          }`}
        >
          {isSelected && <Check size={11} />}
          {isSelected ? 'Active' : 'Make active'}
        </button>
        {!home.isOwner && (
          <span className="px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
            member
          </span>
        )}
      </div>

      {home.isOwner ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Home name"
            />
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={async () => {
                setSaving(true);
                await onSave(name, description);
                setSaving(false);
              }}
              disabled={!dirty || saving || !name.trim()}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <button
              onClick={async () => {
                if (window.confirm(CONFIRM_DELETE)) await onDelete();
              }}
              className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:text-red-500 cursor-pointer"
              aria-label={`Delete ${home.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </>
      ) : (
        <div>
          <Text size="2" as="p">
            {home.name}
          </Text>
          <Text size="1" color="gray">
            {home.description || 'No description'}
          </Text>
        </div>
      )}
    </div>
  );
};

export default function UserSettingsPage() {
  usePageTitle(PAGE_TITLES.USER_SETTINGS);
  const session = useAuth();
  const { homes, selectedHomeId, setSelectedHomeId, refreshHomes } = useHome();
  const [displayName, setDisplayName] = useState(
    (session?.user.user_metadata?.display_name as string) ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    await fetch(USER_API, {
      method: HTTP_METHOD.PATCH,
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ displayName }),
    });
    await supabase.auth.refreshSession();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const createHome = async () => {
    if (!newHomeName.trim() || !session?.user.id) return;
    setCreating(true);
    const { data } = await supabase
      .from('homes')
      .insert({
        name: newHomeName.trim(),
        description: '',
        user_id: session.user.id,
      })
      .select('id')
      .single();
    setNewHomeName('');
    await refreshHomes();
    if (data?.id) setSelectedHomeId(data.id);
    setCreating(false);
  };

  const saveHome = async (id: number, name: string, description: string) => {
    await supabase
      .from('homes')
      .update({ name: name.trim(), description })
      .eq('id', id);
    await refreshHomes();
  };

  const deleteHome = async (id: number) => {
    await supabase.from('homes').delete().eq('id', id);
    await refreshHomes();
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
              <Input
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

      <section className="space-y-3">
        <div>
          <Text size="3" weight="medium" as="p">
            Homes
          </Text>
          <Text size="1" color="gray">
            The active home drives every page and the sidebar. You can also
            switch it from the home picker in the top bar.
          </Text>
        </div>

        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {homes.length === 0 ? (
            <div className="px-4 py-3">
              <Text size="2" color="gray">
                No homes yet. Create one below.
              </Text>
            </div>
          ) : (
            homes.map(home => (
              <HomeRow
                key={home.id}
                home={home}
                isSelected={home.id === selectedHomeId}
                onSelect={() => setSelectedHomeId(home.id)}
                onSave={(name, description) =>
                  saveHome(home.id, name, description)
                }
                onDelete={() => deleteHome(home.id)}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newHomeName}
            onChange={e => setNewHomeName(e.target.value)}
            placeholder="New home name"
          />
          <Button
            onClick={createHome}
            disabled={creating || !newHomeName.trim()}
            className="shrink-0"
          >
            <Plus size={14} /> {creating ? 'Adding…' : 'Add Home'}
          </Button>
        </div>
      </section>
    </div>
  );
}
