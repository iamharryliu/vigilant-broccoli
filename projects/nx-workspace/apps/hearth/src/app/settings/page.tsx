'use client';

import { useRef, useState } from 'react';

import { Button, Checkbox, Text } from '@vigilant-broccoli/react-lib';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { HomeDetailView } from '../homes/components/HomeDetailView';
import { HomeCreateForm } from '../homes/components/HomeCreateForm';
import { supabase } from '../../../libs/supabase';
import { HOME_DATA_EXPORT_GROUPS } from '../../lib/export-groups';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import { loadOneOffTasks, loadTasks } from '../components/tasks.utils';
import {
  DEFAULT_RENAME_LANGUAGE,
  RENAME_ENABLED_KEY,
  RENAME_LANGUAGE_KEY,
  RENAME_LANGUAGES,
} from '../../lib/types';

const USER_API = '/api/user';

const TASKS_EXPORT_KEY = 'tasks';

// Only these have an /api/<key>/import route.
const IMPORTABLE_KEYS: string[] = ['where-is', 'kitchen-planner'];

const EXPORT_OPTIONS = [
  { key: 'kitchen-planner', label: 'Kitchen Planner' },
  { key: TASKS_EXPORT_KEY, label: 'Tasks' },
  { key: 'where-is', label: 'Where Is' },
  ...HOME_DATA_EXPORT_GROUPS,
]
  .map(({ key, label }) => ({ key, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

const HOME_DATA_KEYS = HOME_DATA_EXPORT_GROUPS.map(({ key }) => key);

type ExportKey = string;

const downloadJson = (data: unknown, filename: string) => {
  const url = URL.createObjectURL(
    new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
      type: JSON_CONTENT_TYPE,
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function SettingsPage() {
  usePageTitle(PAGE_TITLES.SETTINGS);
  const session = useAuth();
  const { homes, selectedHomeId, refreshHomes } = useHome();
  const selectedHome = homes.find(h => h.id === selectedHomeId);

  const [selected, setSelected] = useState<Set<ExportKey>>(new Set());
  const importFileRef = useRef<HTMLInputElement>(null);

  const metadata = session?.user.user_metadata ?? {};
  const [renameEnabled, setRenameEnabled] = useState(
    (metadata[RENAME_ENABLED_KEY] as boolean) ?? false,
  );
  const [renameLanguage, setRenameLanguage] = useState(
    (metadata[RENAME_LANGUAGE_KEY] as string) ?? DEFAULT_RENAME_LANGUAGE,
  );

  const patchUser = async (body: Record<string, unknown>) => {
    if (!session?.access_token) return;
    await fetch(USER_API, {
      method: HTTP_METHOD.PATCH,
      headers: {
        [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    await supabase.auth.refreshSession();
  };

  const toggle = (key: ExportKey) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const handleExport = async () => {
    if (!selectedHomeId || !session?.access_token) return;
    for (const key of selected) {
      const filename = `${key}-export-${selectedHomeId}-${Date.now()}.json`;
      if (key === TASKS_EXPORT_KEY) {
        downloadJson(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            recurringTasks: loadTasks(),
            oneOffTasks: loadOneOffTasks(),
          },
          filename,
        );
        continue;
      }
      const url = HOME_DATA_KEYS.includes(key)
        ? `/api/home-data/export?group=${key}&homeId=${selectedHomeId}`
        : `/api/${key}/export?homeId=${selectedHomeId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      downloadJson(await res.text(), filename);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHomeId || !session) return;
    const text = await file.text();
    const importData = JSON.parse(text);
    for (const key of selected) {
      if (!IMPORTABLE_KEYS.includes(key)) continue;
      await fetch(`/api/${key}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          importData,
          homeId: selectedHomeId,
          userId: session.user.id,
        }),
      });
    }
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleCreateHome = async (name: string, description: string) => {
    await supabase
      .from('homes')
      .insert({ name, description, user_id: session?.user.id });
    await refreshHomes();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Text size="6" weight="bold">
        Home Settings
      </Text>

      <section className="space-y-3">
        {selectedHome ? (
          <HomeDetailView homeId={String(selectedHome.id)} />
        ) : (
          <HomeCreateForm onSubmit={handleCreateHome} />
        )}
      </section>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Receipts
        </Text>
        <div className="border border-border rounded-lg divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            <div>
              <Text size="2" as="p">
                Suggest item renames
              </Text>
              <Text size="1" color="gray">
                Scanned items are renamed to their everyday name. The printed
                name is kept and can be restored per item.
              </Text>
            </div>
            <input
              type="checkbox"
              checked={renameEnabled}
              onChange={e => {
                setRenameEnabled(e.target.checked);
                patchUser({ renameEnabled: e.target.checked });
              }}
              className="shrink-0 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            <Text size="2" color="gray" className="shrink-0">
              Rename to
            </Text>
            <select
              value={renameLanguage}
              onChange={e => {
                setRenameLanguage(e.target.value);
                patchUser({ renameLanguage: e.target.value });
              }}
              disabled={!renameEnabled}
              className="h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm disabled:opacity-50"
            >
              {RENAME_LANGUAGES.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Export Data
        </Text>
        <div className="border border-border rounded-lg divide-y divide-border">
          {EXPORT_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50"
            >
              <Checkbox
                checked={selected.has(key)}
                onCheckedChange={() => toggle(key)}
              />
              <Text size="2">{label}</Text>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={selected.size === 0}>
            Export
          </Button>
          <Button
            onClick={() => importFileRef.current?.click()}
            disabled={![...selected].some(key => IMPORTABLE_KEYS.includes(key))}
          >
            Import
          </Button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </section>
    </div>
  );
}
