'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DropdownMenu } from '@radix-ui/themes';
import {
  Badge,
  Button,
  CollapsibleList,
  DeleteItemConfirmationDialog,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  IconButton,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { KitchenProjectItem } from '../../lib/types';
import {
  KitchenProjectForm,
  KitchenProjectFormData,
} from './KitchenProjectForm';
import {
  KIND_LABELS,
  LOCATION_LABELS,
  MINUTE_MS,
  STATUS_COLORS,
  STATUS_LABELS,
  getStatus,
  getStatusDetail,
  sortByUrgency,
} from './kitchen-projects.consts';

const ENDPOINT = '/api/kitchen-projects';
const STORAGE_KEY_PREFIX = 'kitchen-projects';
const EMPTY_TEXT = 'Nothing going on in the kitchen right now';
const ADD_LABEL = 'Log something';
const ADD_DIALOG_TITLE = 'Log a kitchen project';
const EDIT_DIALOG_TITLE = 'Edit kitchen project';
const USED_LABEL = 'Used it up';
const DISCARDED_LABEL = 'Tossed it';
const EDIT_LABEL = 'Edit';
const DELETE_LABEL = 'Delete';
const REOPEN_LABEL = 'Put it back';
const RESOLUTION_USED = 'USED';
const RESOLUTION_DISCARDED = 'DISCARDED';
const TICK_MS = MINUTE_MS;

type Props = {
  refreshSignal?: number;
};

export function KitchenProjectsList({ refreshSignal }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [items, setItems] = useState<KitchenProjectItem[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KitchenProjectItem | null>(
    null,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const token = session?.access_token ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token}` });
  const jsonHeaders = () => ({
    ...authHeader(),
    'Content-Type': 'application/json',
  });

  const fetchItems = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${ENDPOINT}?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshSignal]);

  // Status is derived from the clock, so the badges have to re-render on their own.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = async (data: KitchenProjectFormData) => {
    setFormOpen(false);
    if (!homeId) return;
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ ...data, homeId }),
    });
    const created = await res.json();
    if (created?.id) setItems(prev => [created, ...prev]);
  };

  const patch = async (id: string, body: Partial<KitchenProjectItem>) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...body } : item)),
    );
    await fetch(ENDPOINT, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify({ id, ...body }),
    });
  };

  const handleUpdate = async (data: KitchenProjectFormData) => {
    const id = editingItem?.id;
    setEditingItem(null);
    if (!id) return;
    await patch(id, data as Partial<KitchenProjectItem>);
  };

  const handleResolve = (id: string, resolution: string | null) =>
    patch(id, {
      resolution: resolution as KitchenProjectItem['resolution'],
      resolvedAt: resolution ? new Date().toISOString() : null,
    });

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await fetch(ENDPOINT, {
      method: 'DELETE',
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  };

  const active = useMemo(
    () =>
      sortByUrgency(
        items.filter(item => !item.resolution),
        now,
      ),
    [items, now],
  );

  const resolved = useMemo(
    () =>
      items
        .filter(item => item.resolution)
        .sort((a, b) => (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? '')),
    [items],
  );

  if (!homeId) return null;

  const renderRow = (item: KitchenProjectItem) => {
    const status = getStatus(item, now);
    const detail = getStatusDetail(item, status, now);
    const isResolved = Boolean(item.resolution);

    return (
      <div
        key={item.id}
        className="flex items-start gap-3 border-b border-[var(--gray-a4)] py-2 last:border-b-0"
      >
        <div className="flex min-w-0 grow flex-col gap-1">
          <Text
            size="3"
            weight="medium"
            className={isResolved ? 'text-[var(--gray-a9)] line-through' : ''}
          >
            {item.name}
          </Text>
          <div className="flex flex-wrap items-center gap-1.5">
            {!isResolved && (
              <Badge color={STATUS_COLORS[status]} variant="soft">
                {STATUS_LABELS[status]}
                {detail ? ` · ${detail}` : ''}
              </Badge>
            )}
            <Badge color="gray" variant="surface">
              {KIND_LABELS[item.kind]}
            </Badge>
            <Badge color="gray" variant="surface">
              {LOCATION_LABELS[item.location]}
            </Badge>
          </div>
          {item.notes && (
            <Text size="2" color="gray">
              {item.notes}
            </Text>
          )}
        </div>

        <div onClick={e => e.stopPropagation()}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton icon="ellipsis-vertical" variant="ghost" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {isResolved ? (
                <DropdownMenu.Item
                  onSelect={() => handleResolve(item.id, null)}
                >
                  {REOPEN_LABEL}
                </DropdownMenu.Item>
              ) : (
                <>
                  <DropdownMenu.Item
                    onSelect={() => handleResolve(item.id, RESOLUTION_USED)}
                  >
                    {USED_LABEL}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() =>
                      handleResolve(item.id, RESOLUTION_DISCARDED)
                    }
                  >
                    {DISCARDED_LABEL}
                  </DropdownMenu.Item>
                </>
              )}
              <DropdownMenu.Item onSelect={() => setEditingItem(item)}>
                {EDIT_LABEL}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                color="red"
                onSelect={() => setPendingDeleteId(item.id)}
              >
                {DELETE_LABEL}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setFormOpen(true)}>{ADD_LABEL}</Button>

      {active.length === 0 ? (
        <div className="py-4">
          <Text align="center" color="gray" size="3">
            {EMPTY_TEXT}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">{active.map(renderRow)}</div>
      )}

      {resolved.length > 0 && (
        <CollapsibleList
          storageKeyPrefix={STORAGE_KEY_PREFIX}
          items={[
            {
              id: `${STORAGE_KEY_PREFIX}-resolved`,
              title: `Finished (${resolved.length})`,
              content: (
                <div className="flex flex-col">{resolved.map(renderRow)}</div>
              ),
            },
          ]}
        />
      )}

      <DeleteItemConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteId(null);
        }}
        confirmLabel={DELETE_LABEL}
        deleteItem={async () => {
          if (pendingDeleteId) await handleDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />

      <Dialog.Root
        open={formOpen}
        onOpenChange={open => {
          if (!open) setFormOpen(false);
        }}
      >
        <Dialog.Content
          className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
          style={{ maxWidth: 460 }}
        >
          <Dialog.Title>{ADD_DIALOG_TITLE}</Dialog.Title>
          {formOpen && (
            <KitchenProjectForm
              onSubmit={handleCreate}
              onCancel={() => setFormOpen(false)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={editingItem !== null}
        onOpenChange={open => {
          if (!open) setEditingItem(null);
        }}
      >
        <Dialog.Content
          className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
          style={{ maxWidth: 460 }}
        >
          <Dialog.Title>{EDIT_DIALOG_TITLE}</Dialog.Title>
          {editingItem && (
            <KitchenProjectForm
              item={editingItem}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
