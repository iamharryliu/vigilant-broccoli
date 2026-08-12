'use client';

import { useCallback, useEffect, useState, KeyboardEvent } from 'react';
import { Text } from '@radix-ui/themes';
import {
  Button,
  Checkbox,
  CollapsibleList,
  DeleteIconButton,
  Input,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { GroceryItem } from '../../lib/types';

const COMPLETED_COLLAPSE_ID = 'grocery-completed';

export default function GroceryPage() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [items, setItems] = useState<GroceryItem[]>([]);
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
    const res = await fetch(`/api/grocery?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name || !homeId) return;
    setNewItem('');
    const res = await fetch('/api/grocery', {
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
    await fetch('/api/grocery', {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ id, completed }),
    });
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await fetch('/api/grocery', {
      method: 'DELETE',
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  };

  const startEdit = (item: GroceryItem) => {
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
    await fetch('/api/grocery', {
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

  const renderRow = (item: GroceryItem) => (
    <div
      key={item.id}
      className="flex items-center gap-3 py-3 border-b border-[var(--gray-a4)] last:border-b-0"
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
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 md:max-w-none md:px-8 md:py-8">
      <div>
        <div className="flex flex-col gap-4">
          <Text size="6" weight="bold">
            Grocery List
          </Text>

          <div className="flex gap-2">
            <Input
              className="grow"
              placeholder="Add an item"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={onNewKeyDown}
            />
            <Button onClick={handleAdd} disabled={!newItem.trim()}>
              Add
            </Button>
          </div>

          {active.length === 0 ? (
            <div className="py-8">
              <Text align="center" color="gray" size="3">
                Nothing on the list yet
              </Text>
            </div>
          ) : (
            <div className="flex flex-col">{active.map(renderRow)}</div>
          )}
        </div>
      </div>

      {completed.length > 0 && (
        <div>
          <CollapsibleList
            storageKeyPrefix="grocery"
            items={[
              {
                id: COMPLETED_COLLAPSE_ID,
                title: `Completed (${completed.length})`,
                content: (
                  <div className="flex flex-col">
                    {completed.map(renderRow)}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
