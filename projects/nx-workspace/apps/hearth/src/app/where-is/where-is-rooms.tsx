'use client';

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button, Input, Select, Text } from '@vigilant-broccoli/react-lib';
import {
  CRUDFormProps,
  CRUDItemFormDialog,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib-crud-list';
import {
  FORM_TYPE,
  HTTP_HEADERS,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { WhereIsRoom } from '../../lib/types';
import { WHERE_IS_ROOMS_ENDPOINT } from '../../lib/routes';

const ERROR_ROOM_SAVE = 'Saving the room failed. Please try again.';
// Radix Select reserves the empty string, so "No room" and the add option need their own values.
const NO_ROOM_ID = 'none';
const ADD_ROOM_ID = 'add-new';

const LABEL = {
  ADD: 'Add',
  ADD_NEW_ROOM: '+ Add new room…',
  CANCEL: 'Cancel',
  CREATE_ROOM: 'Create Room',
  DELETE_DESCRIPTION:
    'Delete this room? Its storage areas are kept and become unassigned.',
  DELETE_TITLE: 'Delete Room',
  EMPTY: 'No rooms yet.',
  NEW_ROOM_PLACEHOLDER: 'New room (e.g. Kitchen, Garage)',
  NO_ROOM: 'No room',
  SAVE: 'Save',
  SEARCH_PLACEHOLDER: 'Search rooms...',
  ROOM: 'Room',
  ROOM_NAME: 'Room name',
} as const;

type WhereIsRoomsContextValue = {
  rooms: WhereIsRoom[];
  homeId?: number;
  // Lets the room field create a room inline and keep the page's list in sync.
  onRoomCreated?: (room: WhereIsRoom) => void;
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

  return (
    pageRooms ?? {
      rooms: fetchedRooms,
      homeId,
      onRoomCreated: (room: WhereIsRoom) =>
        setFetchedRooms(prev => sortRooms([...prev, room])),
    }
  );
};

export const WhereIsRoomField = ({
  roomId,
  onChange,
}: {
  roomId: string | null;
  onChange: (roomId: string | null) => void;
}) => {
  const session = useAuth();
  const context = useWhereIsRooms();
  const rooms = context?.rooms ?? [];
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canAdd = context?.homeId !== undefined && !!context.onRoomCreated;
  if (!rooms.length && !canAdd) return null;
  const noRoom = { id: NO_ROOM_ID, homeId: 0, name: LABEL.NO_ROOM };
  const addRoomOption = {
    id: ADD_ROOM_ID,
    homeId: 0,
    name: LABEL.ADD_NEW_ROOM,
  };

  const closeAdd = () => {
    setAdding(false);
    setNewName('');
    setError('');
  };

  const addRoom = async () => {
    const name = newName.trim();
    if (!name || !context?.onRoomCreated) return;
    const existing = rooms.find(
      room => room.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      onChange(existing.id);
      closeAdd();
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created: WhereIsRoom = await roomRequest(
        session?.access_token ?? '',
        HTTP_METHOD.POST,
        { name, homeId: context.homeId, userId: session?.user.id },
      );
      context.onRoomCreated(created);
      onChange(created.id);
      closeAdd();
    } catch (e) {
      setError(e instanceof Error ? e.message : ERROR_ROOM_SAVE);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Text size="1" weight="medium" as="p" mb="1">
        {LABEL.ROOM}
      </Text>
      {adding ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            aria-label={LABEL.ROOM_NAME}
            placeholder={LABEL.NEW_ROOM_PLACEHOLDER}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRoom();
              } else if (e.key === 'Escape') {
                // Keeps the surrounding dialog open.
                e.stopPropagation();
                closeAdd();
              }
            }}
            className="flex-1"
          />
          <Button onClick={addRoom} disabled={saving || !newName.trim()}>
            {LABEL.ADD}
          </Button>
          <Button variant="outline" onClick={closeAdd} disabled={saving}>
            {LABEL.CANCEL}
          </Button>
        </div>
      ) : (
        <Select
          aria-label={LABEL.ROOM}
          value={rooms.find(room => room.id === roomId) ?? noRoom}
          onValueChange={room => {
            if (room.id === ADD_ROOM_ID) setAdding(true);
            else onChange(room.id === NO_ROOM_ID ? null : room.id);
          }}
          options={
            canAdd ? [noRoom, ...rooms, addRoomOption] : [noRoom, ...rooms]
          }
          optionDisplayKey="name"
          className="w-full"
        />
      )}
      {error && (
        <Text size="1" color="red" as="p" role="alert">
          {error}
        </Text>
      )}
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

const ROOMS_COPY = {
  LIST: { TITLE: 'Rooms', EMPTY_MESSAGE: LABEL.EMPTY },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Room',
    DESCRIPTION: 'Group storage areas by the room they are in.',
  },
  [FORM_TYPE.UPDATE]: { TITLE: 'Rename Room', DESCRIPTION: '' },
};

const RoomListItem = ({ item }: { item: WhereIsRoom }) => (
  <Text size="2" weight="medium" as="p">
    {item.name}
  </Text>
);

const RoomForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<WhereIsRoom>) => {
  const [name, setName] = useState(initialFormValues.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await submitHandler(
        { ...initialFormValues, name: name.trim() },
        formType,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : ERROR_ROOM_SAVE);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <Input
        autoFocus
        aria-label={LABEL.ROOM_NAME}
        placeholder={LABEL.NEW_ROOM_PLACEHOLDER}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
      {error && (
        <Text size="1" color="red" as="p" role="alert">
          {error}
        </Text>
      )}
      <Button onClick={submit} disabled={saving || !name.trim()}>
        {formType === FORM_TYPE.UPDATE ? LABEL.SAVE : LABEL.ADD}
      </Button>
    </div>
  );
};

const sortingSetter =
  (setRooms: Dispatch<SetStateAction<WhereIsRoom[]>>) =>
  (next: SetStateAction<WhereIsRoom[]>) =>
    setRooms(prev => sortRooms(typeof next === 'function' ? next(prev) : next));

export const CreateRoomButton = ({
  homeId,
  setRooms,
}: {
  homeId: number;
  setRooms: Dispatch<SetStateAction<WhereIsRoom[]>>;
}) => {
  const session = useAuth();

  return (
    <CRUDItemFormDialog<WhereIsRoom>
      formType={FORM_TYPE.CREATE}
      initialFormValues={{ id: '', homeId, name: '' }}
      FormComponent={RoomForm}
      submitHandler={async room => {
        const created = await roomRequest(
          session?.access_token ?? '',
          HTTP_METHOD.POST,
          { name: room.name, homeId, userId: session?.user.id },
        );
        sortingSetter(setRooms)(prev => [...prev, created]);
      }}
      copy={ROOMS_COPY}
      createLabel={LABEL.CREATE_ROOM}
    />
  );
};

export const ManageRooms = ({
  rooms,
  setRooms,
  onRoomDeleted,
}: {
  rooms: WhereIsRoom[];
  setRooms: Dispatch<SetStateAction<WhereIsRoom[]>>;
  onRoomDeleted: (roomId: string) => void;
}) => {
  const session = useAuth();
  const accessToken = session?.access_token ?? '';
  const [query, setQuery] = useState('');
  const filtered = rooms.filter(room =>
    room.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <CRUDItemList
      items={filtered}
      setItems={sortingSetter(setRooms)}
      updateItem={room =>
        roomRequest(accessToken, HTTP_METHOD.PATCH, {
          id: room.id,
          name: room.name,
        })
      }
      deleteItem={async id => {
        await roomRequest(accessToken, HTTP_METHOD.DELETE, { id });
        onRoomDeleted(String(id));
      }}
      FormComponent={RoomForm}
      ListItemComponent={RoomListItem}
      compact
      copy={ROOMS_COPY}
      search={{
        value: query,
        onChange: setQuery,
        placeholder: LABEL.SEARCH_PLACEHOLDER,
      }}
      deleteConfirmation={{
        title: LABEL.DELETE_TITLE,
        description: LABEL.DELETE_DESCRIPTION,
      }}
    />
  );
};
