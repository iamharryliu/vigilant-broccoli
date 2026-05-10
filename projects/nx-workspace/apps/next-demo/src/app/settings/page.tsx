'use client';

import { useRef, useState } from 'react';
import { Text, Checkbox, Button } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';

const EXPORT_OPTIONS = [{ key: 'where-is', label: 'Where Is' }] as const;

type ExportKey = (typeof EXPORT_OPTIONS)[number]['key'];

const CLEAR_OPTIONS = [
  { key: 'calendar-events', label: 'Calendar Events' },
  { key: 'household-rules', label: 'Household Rules' },
  { key: 'home-members', label: 'Home Members' },
  { key: 'home-resources', label: 'Resources' },
  { key: 'resource-bookings', label: 'Resource Bookings' },
  { key: 'home-projects', label: 'Projects' },
  { key: 'leisure-activities', label: 'Leisure Activities' },
  { key: 'meals', label: 'Meals' },
  { key: 'docs', label: 'Documents' },
  { key: 'where-is', label: 'Where Is' },
] as const;

type ClearKey = (typeof CLEAR_OPTIONS)[number]['key'];

export default function SettingsPage() {
  const session = useAuth();
  const { homes, selectedHomeId } = useHome();
  const selectedHome = homes.find(h => h.id === selectedHomeId);

  const [selected, setSelected] = useState<Set<ExportKey>>(new Set());
  const importFileRef = useRef<HTMLInputElement>(null);

  const [clearSelected, setClearSelected] = useState<Set<ClearKey>>(new Set());
  const [clearing, setClearing] = useState(false);
  const [clearResults, setClearResults] = useState<Record<
    string,
    string
  > | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<Record<string, string> | null>(
    null,
  );

  const toggle = (key: ExportKey) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleClear = (key: ClearKey) =>
    setClearSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const allClearKeys = CLEAR_OPTIONS.map(o => o.key);
  const allClearSelected = allClearKeys.every(k => clearSelected.has(k));
  const toggleAllClear = () =>
    setClearSelected(allClearSelected ? new Set() : new Set(allClearKeys));

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

  const handleSeed = async () => {
    if (!selectedHomeId || !session?.access_token) return;
    setSeeding(true);
    setSeedResults(null);
    const res = await fetch('/api/dev/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ homeId: selectedHomeId }),
    });
    const { results } = await res.json();
    setSeedResults(results);
    setSeeding(false);
  };

  const handleClear = async () => {
    if (!selectedHomeId || !session?.access_token || clearSelected.size === 0)
      return;
    setClearing(true);
    setClearResults(null);
    const res = await fetch('/api/dev/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        homeId: selectedHomeId,
        keys: [...clearSelected],
      }),
    });
    const { results } = await res.json();
    setClearResults(results);
    setClearing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Text size="6" weight="bold">
        Settings
      </Text>

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

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Text size="3" weight="medium">
            Dev
          </Text>
          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
            danger
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSeed}
            disabled={seeding || !selectedHomeId}
            loading={seeding}
          >
            Seed Mock Data
          </Button>
          <Text size="1" color="gray">
            Inserts sample rules, meals, projects, events and more.
          </Text>
        </div>
        {seedResults && (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {Object.entries(seedResults).map(([key, status]) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-2"
              >
                <Text size="2" color="gray">
                  {key}
                </Text>
                <Text size="2" color={status === 'ok' ? 'green' : 'red'}>
                  {status}
                </Text>
              </div>
            ))}
          </div>
        )}

        <Text size="2" color="gray">
          Clear all records for the selected home. This is irreversible.
        </Text>
        <div className="border border-red-100 rounded-lg divide-y divide-red-50">
          <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50">
            <Checkbox
              checked={allClearSelected}
              onCheckedChange={toggleAllClear}
            />
            <Text size="2" weight="medium">
              Select All
            </Text>
          </label>
          {CLEAR_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-red-50"
            >
              <Checkbox
                checked={clearSelected.has(key)}
                onCheckedChange={() => toggleClear(key)}
              />
              <Text size="2">{label}</Text>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button
            color="red"
            onClick={handleClear}
            disabled={clearSelected.size === 0 || clearing || !selectedHomeId}
            loading={clearing}
          >
            Clear Selected
          </Button>
          {clearSelected.size > 0 && (
            <Text size="1" color="gray">
              {clearSelected.size} selected
            </Text>
          )}
        </div>
        {clearResults && (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mt-2">
            {Object.entries(clearResults).map(([key, status]) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-2"
              >
                <Text size="2" color="gray">
                  {key}
                </Text>
                <Text size="2" color={status === 'ok' ? 'green' : 'red'}>
                  {status}
                </Text>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
