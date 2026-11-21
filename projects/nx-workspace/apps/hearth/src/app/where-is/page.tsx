'use client';

import {
  Suspense,
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DoorOpen } from 'lucide-react';
import {
  Input,
  Text,
  Badge,
  Button,
  Select,
  Skeleton,
  cn,
} from '@vigilant-broccoli/react-lib';
import { CRUDItemList } from '@vigilant-broccoli/react-lib-crud-list';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhereIsItem, WhereIsRoom } from '../../lib/types';
import {
  ROUTES,
  WHERE_IS_ENDPOINT,
  WHERE_IS_ITEM_PARAM,
} from '../../lib/routes';
import {
  WhereIsFormComponent,
  WhereIsFormValues,
  PreviewImage,
} from './where-is-form';
import { throwIfNotOk, uploadPreviewImages } from './upload-images';
import { sortTags } from './where-is-tags';
import { saveWhereIsUpdate, toWhereIsFormValues } from './save-where-is';
import { WhereIsDetailPanel } from './where-is-detail-panel';
import { useMobileReady } from '../../lib/use-mobile-view';
import { WhereIsDetailPageContent } from './WhereIsDetailPageContent';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import {
  ManageRoomsDialog,
  WhereIsRoomsContext,
  fetchWhereIsRooms,
  findRoomName,
  sortRooms,
} from './where-is-rooms';

const DEFAULT_FORM: WhereIsFormValues = {
  id: '',
  title: '',
  description: '',
  tags: [],
  roomId: null,
  images: [],
};

const LIST_TITLE = 'Storage Areas';
const EMPTY_LIST_MESSAGE = 'No storage areas yet.';
const EMPTY_ROOM_MESSAGE = 'No storage areas in this room.';
const NO_MATCHES_MESSAGE = 'No matching storage areas.';
const MANAGE_ROOMS = 'Manage rooms';
const ROOM_FILTER_LABEL = 'Filter by room';

// Sentinel ids for the room filter; real room ids are uuids.
const ROOM_FILTER = { ALL: 'all', UNASSIGNED: 'unassigned' } as const;
const ALL_ROOMS_OPTION = { id: ROOM_FILTER.ALL, name: 'All rooms' };
const UNASSIGNED_OPTION = { id: ROOM_FILTER.UNASSIGNED, name: 'Unassigned' };

const makeCopy = (title: string, emptyMessage: string) => ({
  LIST: { TITLE: title, EMPTY_MESSAGE: emptyMessage },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Storage Area',
    DESCRIPTION:
      'Add details manually, or upload photos and analyze them to suggest tags.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Storage Area',
    DESCRIPTION: '',
  },
});

const fuzzyMatch = (
  query: string,
  item: WhereIsItem,
  roomName: string | null,
): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [item.title, item.description, ...item.tags, roomName]
    .join(' ')
    .toLowerCase();
  return q.split(' ').every(word => searchText.includes(word));
};

const WhereIsListItem = ({ item }: { item: WhereIsFormValues }) => (
  <div className="min-w-0">
    <Text weight="bold" size="2" as="p">
      {item.title}
    </Text>
    <Text size="1" color="gray" as="p">
      {item.description}
    </Text>
    <div className="flex flex-wrap gap-1 mt-1">
      {sortTags(item.tags).map(tag => (
        <Badge key={tag} variant="soft" size="1">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

const SKELETON_ROW_COUNT = 4;

const ListSkeleton = () => (
  <div className="space-y-2" aria-busy="true">
    {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2">
        <Skeleton className="h-16 w-16 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

function WhereIsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useAuth();
  const { selectedHomeId } = useHome();
  const [items, setItems] = useState<WhereIsItem[]>([]);
  const [rooms, setRooms] = useState<WhereIsRoom[]>([]);
  const [roomFilter, setRoomFilter] = useState<string>(ROOM_FILTER.ALL);
  const [manageRoomsOpen, setManageRoomsOpen] = useState(false);
  // Room of each item whose form is open, so a room change keeps its row (and dialog) mounted.
  const [pinnedRoomIds, setPinnedRoomIds] = useState<
    Map<string, string | null>
  >(new Map());
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  const selectedItemId = searchParams.get(WHERE_IS_ITEM_PARAM);

  useEffect(() => {
    if (selectedHomeId === null) return;
    const accessToken = session?.access_token ?? '';
    setLoaded(false);
    setRoomFilter(ROOM_FILTER.ALL);
    Promise.all([
      fetch(`${WHERE_IS_ENDPOINT}?homeId=${selectedHomeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(r => r.json()),
      fetchWhereIsRooms(selectedHomeId, accessToken),
    ]).then(([data, homeRooms]) => {
      setItems(data);
      setRooms(sortRooms(homeRooms));
      setLoaded(true);
    });
  }, [selectedHomeId, session?.access_token]);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onEditStart = useCallback((itemId: string) => {
    const roomId = itemsRef.current.find(i => i.id === itemId)?.roomId ?? null;
    setPinnedRoomIds(prev =>
      prev.has(itemId) ? prev : new Map(prev).set(itemId, roomId),
    );
  }, []);
  const onEditEnd = useCallback(
    (itemId: string) =>
      setPinnedRoomIds(prev => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      }),
    [],
  );
  const roomsContext = useMemo(
    () => ({ rooms, onEditStart, onEditEnd }),
    [rooms, onEditStart, onEditEnd],
  );

  const createItem = async (
    form: WhereIsFormValues,
  ): Promise<WhereIsFormValues> => {
    const { description, tags, roomId } = form;
    const accessToken = session?.access_token ?? '';
    const images = await uploadPreviewImages(form.images, accessToken);

    const saveRes = await fetch(WHERE_IS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: form.title,
        description,
        tags,
        roomId,
        homeId: selectedHomeId,
        userId: session?.user.id,
        images,
      }),
    });
    await throwIfNotOk(saveRes);
    const { id } = (await saveRes.json()) as { id: string };

    const res = await fetch(`${WHERE_IS_ENDPOINT}?id=${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    await throwIfNotOk(res);
    const newItem: WhereIsItem = await res.json();

    return {
      ...toWhereIsFormValues(newItem),
      thumbnailUrl: newItem.thumbnailUrl,
    };
  };

  const updateItem = async (
    form: WhereIsFormValues,
  ): Promise<WhereIsFormValues> => {
    const updated = await saveWhereIsUpdate(
      form,
      items.find(i => i.id === form.id)?.imageKeys ?? [],
      session?.access_token ?? '',
    );
    return {
      ...form,
      ...toWhereIsFormValues(updated),
      thumbnailUrl: updated.thumbnailUrl,
    };
  };

  const deleteItem = async (id: string | number) => {
    await fetch(WHERE_IS_ENDPOINT, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ id }),
    });
  };

  const openItemInPanel = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(WHERE_IS_ITEM_PARAM, id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeItemPanel = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(WHERE_IS_ITEM_PARAM);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  if (selectedHomeId === null) return null;

  const roomIds = new Set(rooms.map(room => room.id));
  // A room id the page no longer knows (e.g. just deleted) counts as Unassigned.
  const groupIdOf = (item: WhereIsItem) => {
    const roomId = pinnedRoomIds.has(item.id)
      ? pinnedRoomIds.get(item.id)
      : item.roomId;
    return roomId && roomIds.has(roomId) ? roomId : ROOM_FILTER.UNASSIGNED;
  };

  const filtered = items.filter(item =>
    fuzzyMatch(query, item, findRoomName(rooms, item.roomId)),
  );

  const toFormItem = (item: WhereIsItem) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    roomId: item.roomId,
    images: [] as PreviewImage[],
    imageUrls: item.imageUrls,
    imageKeys: item.imageKeys,
    thumbnailUrl: item.thumbnailUrl,
    createdAt: item.createdAt,
  });

  const isSearching = query.trim() !== '';
  const groups = rooms.length
    ? [...rooms, UNASSIGNED_OPTION]
        .filter(
          group => roomFilter === ROOM_FILTER.ALL || group.id === roomFilter,
        )
        .map(group => ({
          id: group.id,
          title: group.name,
          emptyMessage: EMPTY_ROOM_MESSAGE,
          // A room group's add button starts the new storage area in that room.
          roomId: group.id === ROOM_FILTER.UNASSIGNED ? null : group.id,
          items: filtered.filter(item => groupIdOf(item) === group.id),
        }))
        .filter(group => !isSearching || group.items.length > 0)
    : [
        {
          id: ROOM_FILTER.ALL,
          title: LIST_TITLE,
          emptyMessage: EMPTY_LIST_MESSAGE,
          roomId: null,
          items: filtered,
        },
      ];

  const filterOptions = [ALL_ROOMS_OPTION, ...rooms, UNASSIGNED_OPTION];

  const renderList = (onItemClick: (item: { id: string }) => void) => (
    <>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search items (e.g. scissors, batteries)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-48"
        />
        {rooms.length > 0 && (
          <Select
            aria-label={ROOM_FILTER_LABEL}
            value={
              filterOptions.find(option => option.id === roomFilter) ??
              ALL_ROOMS_OPTION
            }
            onValueChange={option => setRoomFilter(option.id)}
            options={filterOptions}
            optionDisplayKey="name"
          />
        )}
        <Button variant="outline" onClick={() => setManageRoomsOpen(true)}>
          <DoorOpen size={16} aria-hidden />
          {MANAGE_ROOMS}
        </Button>
      </div>
      {!loaded ? (
        <ListSkeleton />
      ) : !groups.length ? (
        <Text size="2" color="gray" as="p">
          {NO_MATCHES_MESSAGE}
        </Text>
      ) : (
        groups.map(group => (
          <CRUDItemList
            key={group.id}
            items={group.items.map(toFormItem) as never}
            setItems={setItems as never}
            createItem={createItem as never}
            createItemFormDefaultValues={{
              ...DEFAULT_FORM,
              roomId: group.roomId,
            }}
            updateItem={updateItem as never}
            deleteItem={deleteItem}
            FormComponent={WhereIsFormComponent as never}
            ListItemComponent={WhereIsListItem as never}
            copy={makeCopy(group.title, group.emptyMessage)}
            getItemImages={(item: WhereIsFormValues) =>
              item.thumbnailUrl ? [item.thumbnailUrl] : []
            }
            getItemTitle={(item: { title: string }) => item.title}
            onItemClick={onItemClick}
            showDialogCloseButton
          />
        ))
      )}
    </>
  );

  const handleRoomDeleted = (roomId: string) => {
    setItems(prev =>
      prev.map(item =>
        item.roomId === roomId ? { ...item, roomId: null } : item,
      ),
    );
    setRoomFilter(prev => (prev === roomId ? ROOM_FILTER.ALL : prev));
  };

  return (
    <WhereIsRoomsContext.Provider value={roomsContext}>
      <ManageRoomsDialog
        open={manageRoomsOpen}
        onOpenChange={setManageRoomsOpen}
        homeId={selectedHomeId}
        rooms={rooms}
        onRoomsChange={setRooms}
        onRoomDeleted={handleRoomDeleted}
      />

      {/* Mobile: unchanged page-to-page navigation */}
      <div className="md:hidden max-w-5xl mx-auto p-2 sm:p-6 space-y-6">
        {renderList(item => router.push(ROUTES.WHERE_IS_DETAIL(item.id)))}
      </div>

      {/* Desktop: dashboard with Finder-style slide-over preview */}
      <div className="hidden md:block">
        <div
          className={cn(
            'p-6 space-y-6 transition-[padding] duration-300',
            selectedItemId && 'md:pr-[29rem]',
          )}
        >
          {renderList(item => openItemInPanel(item.id))}
        </div>

        <WhereIsDetailPanel
          itemId={selectedItemId}
          onClose={closeItemPanel}
          onUpdated={updated =>
            setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)))
          }
          onDeleted={id => {
            closeItemPanel();
            setItems(prev => prev.filter(i => i.id !== id));
          }}
        />
      </div>
    </WhereIsRoomsContext.Provider>
  );
}

function WhereIsMobileGate() {
  const itemId = useSearchParams().get(WHERE_IS_ITEM_PARAM);
  const { ready, isMobile } = useMobileReady();
  if (!ready) return null;
  if (isMobile && itemId) return <WhereIsDetailPageContent id={itemId} />;
  return <WhereIsPageContent />;
}

export default function WhereIsPage() {
  usePageTitle(PAGE_TITLES.WHERE_IS);
  return (
    <Suspense fallback={null}>
      <WhereIsMobileGate />
    </Suspense>
  );
}
