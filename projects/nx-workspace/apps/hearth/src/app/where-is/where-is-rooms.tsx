'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  Button,
  DeleteItemConfirmationDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  IconButton,
  Input,
  Select,
  Text,
} from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { WhereIsRoom } from '../../lib/types';
import { WHERE_IS_ROOMS_ENDPOINT } from '../../lib/routes';

const ERROR_ROOM_SAVE = 'Saving the room failed. Please try again.';
// Radix Select reserves the empty string, so "No room" needs its own value.
const NO_ROOM_ID = 'none';

const LABEL = {
  ADD: 'Add',
  DELETE_DESCRIPTION: (name: string) =>
    `Delete the room "${name}"? Its storage areas are kept and become unassigned.`,
  DELETE_ROOM: 'Delete room',
  DELETE_TITLE: 'Delete Room',
  DESCRIPTION: 'Group storage areas by the room they are in.',
  EMPTY: 'No rooms yet.',
  NEW_ROOM_PLACEHOLDER: 'New room (e.g. Kitchen, Garage)',
  NO_ROOM: 'No room',
  RENAME: 'Rename',
  ROOM: 'Room',
  ROOM_NAME: 'Room name',
  TITLE: 'Manage Rooms',
} as const;

type WhereIsRoomsContextValue = {
  rooms: WhereIsRoom[];
  // Lets the list keep an item in its current group while its form is open,
  // so a room change does not unmount the dialog mid-edit.
  onEditStart?: (itemId: string) => void;
  onEditEnd?: (itemId: string) => void;
};

export const WhereIsRoomsContext =
  createContext<WhereIsRoomsContextValue | null>(null);

export const useWhereIsRooms = () => useContext(WhereIsRoomsContext);

// Keeps the item's list row (and the open form dialog) in place until the form unmounts.
export const usePinRoomWhileEditing = (itemId: string, enabled: boolean) => {
  const context = useWhereIsRooms();
  const onEditStart = context?.onEditStart;
  const onEditEnd = context?.onEditEnd;
  useEffect(() => {
    if (!enabled || !itemId) return;
    onEditStart?.(itemId);
    return () => onEditEnd?.(itemId);
  }, [enabled, itemId, onEditStart, onEditEnd]);
};

// The Where Is page provides its rooms; the mobile detail page loads its own.
export const useWhereIsRoomsOrFetch = (homeId: number | undefined) => {
  const session = useAuth();
  const pageRooms = useWhereIsRooms();
  const [fetchedRooms, setFetchedRooms] = useState<WhereIsRoom[]>([]);
  const accessToken = session?.access_token;

  useEffect(() => {
    if (pageRooms || !homeId || !accessToken) return;
    fetchWhereIsRooms(homeId, accessToken).then(rooms =>
      setFetchedRooms(sortRooms(rooms)),
    );
  }, [pageRooms, homeId, accessToken]);

  return pageRooms ?? { rooms: fetchedRooms };
};

export const WhereIsRoomField = ({
  roomId,
  onChange,
}: {
  roomId: string | null;
  onChange: (roomId: string | null) => void;
}) => {
  const rooms = useWhereIsRooms()?.rooms ?? [];
  if (!rooms.length) return null;
  const noRoom = { id: NO_ROOM_ID, homeId: 0, name: LABEL.NO_ROOM };

  return (
    <div>
      <Text size="1" weight="medium" as="p" mb="1">
        {LABEL.ROOM}
      </Text>
      <Select
        aria-label={LABEL.ROOM}
        value={rooms.find(room => room.id === roomId) ?? noRoom}
        onValueChange={room =>
          onChange(room.id === NO_ROOM_ID ? null : room.id)
        }
        options={[noRoom, ...rooms]}
        optionDisplayKey="name"
        className="w-full"
      />
    </div>
  );
};

export const sortRooms = (rooms: WhereIsRoom[]) =>
  [...rooms].sort((a, b) => a.name.localeCompare(b.name));

export const findRoomName = (rooms: WhereIsRoom[], roomId: string | null) =>
  rooms.find(room => room.id === roomId)?.name ?? null;

const roomRequest = async (
  accessToken: string,
  method: string,
  body: object,
): Promise<WhereIsRoom> => {
  const res = await fetch(WHERE_IS_ROOMS_ENDPOINT, {
    method,
    headers: {
      ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      ...HTTP_HEADERS.AUTHORIZATION(accessToken),
    },
    body: JSON.stringify(body),
  });
  // Not upload-images' throwIfNotOk: that module imports the form, which imports this one.
  const result = await res.json().catch(() => null);
  if (!res.ok) throw new Error(result?.error ?? ERROR_ROOM_SAVE);
  return result;
};

export const fetchWhereIsRooms = async (
  homeId: number,
  accessToken: string,
): Promise<WhereIsRoom[]> => {
  const res = await fetch(`${WHERE_IS_ROOMS_ENDPOINT}?homeId=${homeId}`, {
    headers: HTTP_HEADERS.AUTHORIZATION(accessToken),
  });
  return res.ok ? res.json() : [];
};

const RoomRow = ({
  room,
  onRename,
  onDelete,
}: {
  room: WhereIsRoom;
  onRename: (room: WhereIsRoom, name: string) => Promise<void>;
  onDelete: (room: WhereIsRoom) => Promise<void>;
}) => {
  const [name, setName] = useState(room.name);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const changed = name.trim() !== room.name && name.trim() !== '';

  const rename = async () => {
    if (!changed) return;
    setSaving(true);
    try {
      await onRename(room, name.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        aria-label={LABEL.ROOM_NAME}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            rename();
          }
        }}
        className="flex-1"
      />
      {changed && (
        <Button size="sm" onClick={rename} disabled={saving}>
          {LABEL.RENAME}
        </Button>
      )}
      <IconButton
        variant="ghost"
        icon="trash"
        aria-label={LABEL.DELETE_ROOM}
        onClick={() => setConfirmingDelete(true)}
      />
      <DeleteItemConfirmationDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={LABEL.DELETE_TITLE}
        description={LABEL.DELETE_DESCRIPTION(room.name)}
        deleteItem={() => onDelete(room)}
      />
    </div>
  );
};

export const ManageRoomsDialog = ({
  open,
  onOpenChange,
  homeId,
  rooms,
  onRoomsChange,
  onRoomDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: number;
  rooms: WhereIsRoom[];
  onRoomsChange: (rooms: WhereIsRoom[]) => void;
  onRoomDeleted: (roomId: string) => void;
}) => {
  const session = useAuth();
  const accessToken = session?.access_token ?? '';
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const withError = async (action: () => Promise<void>) => {
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : ERROR_ROOM_SAVE);
    }
  };

  const addRoom = () =>
    withError(async () => {
      if (!newName.trim()) return;
      setAdding(true);
      try {
        const created: WhereIsRoom = await roomRequest(
          accessToken,
          HTTP_METHOD.POST,
          { name: newName, homeId, userId: session?.user.id },
        );
        onRoomsChange(sortRooms([...rooms, created]));
        setNewName('');
      } finally {
        setAdding(false);
      }
    });

  const renameRoom = (room: WhereIsRoom, name: string) =>
    withError(async () => {
      const renamed: WhereIsRoom = await roomRequest(
        accessToken,
        HTTP_METHOD.PATCH,
        { id: room.id, name },
      );
      onRoomsChange(
        sortRooms(rooms.map(r => (r.id === room.id ? renamed : r))),
      );
    });

  const deleteRoom = (room: WhereIsRoom) =>
    withError(async () => {
      await roomRequest(accessToken, HTTP_METHOD.DELETE, { id: room.id });
      onRoomsChange(rooms.filter(r => r.id !== room.id));
      onRoomDeleted(room.id);
    });

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) setError('');
        onOpenChange(next);
      }}
    >
      <DialogContent fullScreenOnMobile>
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          {LABEL.TITLE}
        </DialogTitle>
        <DialogDescription className="text-base">
          {LABEL.DESCRIPTION}
        </DialogDescription>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder={LABEL.NEW_ROOM_PLACEHOLDER}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRoom();
                }
              }}
              className="flex-1"
            />
            <Button onClick={addRoom} disabled={adding || !newName.trim()}>
              {LABEL.ADD}
            </Button>
          </div>
          {error && (
            <Text size="1" color="red" as="p" role="alert">
              {error}
            </Text>
          )}
          {rooms.length ? (
            rooms.map(room => (
              <RoomRow
                // Keyed by name too so a rename resets the row's draft.
                key={`${room.id}:${room.name}`}
                room={room}
                onRename={renameRoom}
                onDelete={deleteRoom}
              />
            ))
          ) : (
            <Text size="2" color="gray" as="p">
              {LABEL.EMPTY}
            </Text>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
