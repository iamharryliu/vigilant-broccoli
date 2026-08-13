'use client';

import { useCallback, useEffect, useState, KeyboardEvent } from 'react';
import {
  Button,
  Checkbox,
  CollapsibleList,
  DeleteIconButton,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { ChecklistItem } from '../../lib/types';

type ChecklistProps = {
  endpoint: string;
  storageKeyPrefix: string;
  addPlaceholder: string;
  emptyText: string;
};

export function Checklist({
  endpoint,
  storageKeyPrefix,
  addPlaceholder,
  emptyText,
}: ChecklistProps) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const token = session?.access_token ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token}` });
  const jsonHeaders = () => ({
    ...authHeader(),
    'Content-Type': 'application/json',
  });

  const fetchItems = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${endpoint}?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [endpoint, homeId, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name || !homeId) return;
    setNewItem('');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ name, homeId }),
    });
    const created = await res.json();
    if (created?.id) setItems(prev => [created, ...prev]);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              completed,
              completedAt: completed ? new Date().toISOString() : null,
            }
          : item,
      ),
    );
    await fetch(endpoint, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ id, completed }),
    });
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await fetch(endpoint, {
      method: 'DELETE',
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const saveEdit = async () => {
    const id = editingId;
    const name = editingName.trim();
    setEditingId(null);
    setEditingName('');
    if (!id || !name) return;
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, name } : item)),
    );
    await fetch(endpoint, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ id, name }),
    });
  };

  const onNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const onEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditingName('');
    }
  };

  if (!homeId) return null;

  const active = items.filter(item => !item.completed);
  const completed = items
    .filter(item => item.completed)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  const renderRow = (item: ChecklistItem) => (
    <div
      key={item.id}
      className="flex items-center gap-3 py-1.5 border-b border-[var(--gray-a4)] last:border-b-0"
    >
      <Checkbox
        className="h-5 w-5 shrink-0"
        checked={item.completed}
        onCheckedChange={checked => handleToggle(item.id, checked === true)}
      />
      {editingId === item.id ? (
        <Input
          autoFocus
          className="grow"
          value={editingName}
          onChange={e => setEditingName(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={onEditKeyDown}
        />
      ) : (
        <Text
          size="3"
          className={`grow cursor-text ${
            item.completed ? 'line-through text-[var(--gray-a9)]' : ''
          }`}
          onClick={() => !item.completed && startEdit(item)}
        >
          {item.name}
        </Text>
      )}
      <DeleteIconButton onClick={() => handleDelete(item.id)} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          className="grow"
          placeholder={addPlaceholder}
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={onNewKeyDown}
        />
        <Button onClick={handleAdd} disabled={!newItem.trim()}>
          Add
        </Button>
      </div>

      {active.length === 0 ? (
        <div className="py-4">
          <Text align="center" color="gray" size="3">
            {emptyText}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">{active.map(renderRow)}</div>
      )}

      {completed.length > 0 && (
        <CollapsibleList
          storageKeyPrefix={storageKeyPrefix}
          items={[
            {
              id: `${storageKeyPrefix}-completed`,
              title: `Completed (${completed.length})`,
              content: (
                <div className="flex flex-col">{completed.map(renderRow)}</div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
