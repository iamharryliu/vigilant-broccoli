'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button, Input, Text } from '@vigilant-broccoli/react-lib';
import {
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib-higher-level';
import {
  CONTENT_TYPE_HEADER,
  FORM_TYPE,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { supabase } from '../../../libs/supabase';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import { Home } from '../../lib/types';

const USER_API = '/api/user';
const FEEDBACK_RESET_MS = 1500;
const DISPLAY_NAME_DEBOUNCE_MS = 800;

const DEFAULT_HOME_FORM: Home = { id: 0, name: '', description: '' };

const HOMES_COPY = {
  LIST: { TITLE: 'Homes', EMPTY_MESSAGE: 'No homes yet. Create one.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Home',
    DESCRIPTION: 'Create a new home.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Home',
    DESCRIPTION: 'Edit the home name and description.',
  },
};

const DELETE_HOME_CONFIRMATION = {
  title: 'Delete Home',
  description: 'Delete this home? Everything stored under it is removed too.',
};

const HomeListItem = ({ home }: { home: Home }) => {
  const { selectedHomeId } = useHome();
  const isSelected = home.id === selectedHomeId;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <Text weight="bold" size="2">
          {home.name}
        </Text>
        {isSelected && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs">
            <Check size={11} /> Active
          </span>
        )}
        {!home.isOwner && (
          <span className="px-2 py-0.5 rounded-full border border-border dark:border-gray-700 text-xs text-muted-foreground">
            member
          </span>
        )}
      </div>
      <Text size="1" color="gray" as="p">
        {home.description || 'No description'}
      </Text>
    </div>
  );
};

const HomeForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<Home>) => {
  const [name, setName] = useState(initialFormValues.name);
  const [description, setDescription] = useState(
    initialFormValues.description ?? '',
  );

  return (
    <div className="flex flex-col gap-3 mt-3">
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
      <Button
        onClick={async () =>
          submitHandler(
            { ...initialFormValues, name: name.trim(), description },
            formType,
          )
        }
        disabled={!name.trim()}
      >
        {formType === FORM_TYPE.UPDATE ? 'Save' : 'Add Home'}
      </Button>
    </div>
  );
};

export default function UserSettingsPage() {
  usePageTitle(PAGE_TITLES.USER_SETTINGS);
  const session = useAuth();
  const { homes, setSelectedHomeId, refreshHomes } = useHome();
  const initialDisplayName =
    (session?.user.user_metadata?.display_name as string) ?? '';
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const lastSavedName = useRef(initialDisplayName.trim());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userIdCopied, setUserIdCopied] = useState(false);

  const handleCopyUserId = async () => {
    if (!session?.user.id) return;
    await navigator.clipboard.writeText(session.user.id);
    setUserIdCopied(true);
    setTimeout(() => setUserIdCopied(false), FEEDBACK_RESET_MS);
  };

  const accessToken = session?.access_token;

  useEffect(() => {
    const trimmed = displayName.trim();
    if (!accessToken || !trimmed || trimmed === lastSavedName.current) return;
    const timeout = setTimeout(async () => {
      setSaving(true);
      await fetch(USER_API, {
        method: HTTP_METHOD.PATCH,
        headers: {
          [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ displayName: trimmed }),
      });
      lastSavedName.current = trimmed;
      // Refreshing swaps the access token, which would re-run this effect; the
      // lastSavedName guard above makes that re-run a no-op.
      await supabase.auth.refreshSession();
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), FEEDBACK_RESET_MS);
    }, DISPLAY_NAME_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [displayName, accessToken]);

  const createHome = async (home: Home) => {
    const { data } = await supabase
      .from('homes')
      .insert({
        name: home.name,
        description: home.description,
        user_id: session?.user.id,
      })
      .select('id')
      .single();
    await refreshHomes();
    if (data?.id) setSelectedHomeId(data.id);
    return { ...home, id: data?.id ?? home.id };
  };

  const updateHome = async (home: Home) => {
    await supabase
      .from('homes')
      .update({ name: home.name, description: home.description })
      .eq('id', home.id);
    await refreshHomes();
  };

  const deleteHome = async (id: string | number) => {
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
        <div className="border border-border rounded-lg divide-y divide-border">
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
            {session?.user.id ? (
              <button
                onClick={handleCopyUserId}
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-inherit p-0"
                aria-label="Copy user ID"
              >
                <Text size="2" className="font-mono text-xs">
                  {session.user.id}
                </Text>
                {userIdCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            ) : (
              <Text size="2">—</Text>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Profile
        </Text>
        <div className="flex items-center justify-between gap-4">
          <Text size="2" color="gray" className="shrink-0">
            Display Name
          </Text>
          <div className="flex items-center gap-2">
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter display name"
            />
            <Text size="1" color="gray" className="w-12">
              {saving ? 'Saving…' : saved ? 'Saved' : ''}
            </Text>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <CRUDItemList
          items={homes}
          // Homes live in HomeProvider; the handlers below refresh it.
          setItems={() => undefined}
          FormComponent={HomeForm}
          ListItemComponent={({ item }) => <HomeListItem home={item} />}
          createItem={createHome}
          createItemFormDefaultValues={DEFAULT_HOME_FORM}
          updateItem={updateHome}
          deleteItem={deleteHome}
          canShowEllipsis={home => Boolean(home.isOwner)}
          onItemClick={home => setSelectedHomeId(home.id)}
          copy={HOMES_COPY}
          deleteConfirmation={DELETE_HOME_CONFIRMATION}
          isCards
        />
      </section>
    </div>
  );
}
