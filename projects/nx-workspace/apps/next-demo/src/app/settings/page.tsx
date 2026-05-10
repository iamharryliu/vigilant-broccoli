'use client';

import { useRef, useState } from 'react';
import { Text, Checkbox, Button } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';

const EXPORT_OPTIONS = [{ key: 'where-is', label: 'Where Is' }] as const;

type ExportKey = (typeof EXPORT_OPTIONS)[number]['key'];

export default function SettingsPage() {
  const session = useAuth();
  const { homes, selectedHomeId } = useHome();
  const selectedHome = homes.find(h => h.id === selectedHomeId);
  const [selected, setSelected] = useState<Set<ExportKey>>(new Set());
  const importFileRef = useRef<HTMLInputElement>(null);

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
      if (key === 'where-is') {
        const res = await fetch(
          `/api/where-is/export?homeId=${selectedHomeId}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        );
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `where-is-export-${selectedHomeId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHomeId || !session) return;
    const text = await file.text();
    const importData = JSON.parse(text);

    if (selected.has('where-is')) {
      await fetch('/api/where-is/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importData,
          homeId: selectedHomeId,
          userId: session.user.id,
          accessToken: session.access_token,
        }),
      });
    }

    if (importFileRef.current) importFileRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Text size="6" weight="bold">
        Settings
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
          Home
        </Text>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              Selected Home
            </Text>
            <Text size="2">{selectedHome?.name ?? '—'}</Text>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              Home ID
            </Text>
            <Text size="2">{selectedHomeId ?? '—'}</Text>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              Total Homes
            </Text>
            <Text size="2">{homes.length}</Text>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Export Data
        </Text>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {EXPORT_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
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
            onClick={async () => importFileRef.current?.click()}
            disabled={selected.size === 0}
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
