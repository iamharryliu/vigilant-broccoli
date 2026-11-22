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
import { Eye } from 'lucide-react';
import {
  Text,
  Badge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@vigilant-broccoli/react-lib';
import {
  CRUDItemFormDialog,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib-crud-list';
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
  CreateRoomButton,
  ManageRooms,
  WhereIsRoomsContext,
  useWhereIsRooms,
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
const CREATE_LABEL = 'Create Storage Area';
const VIEW_DETAILS_LABEL = 'View details';
const SEARCH_PLACEHOLDER = 'Search items (e.g. scissors, batteries)...';
const TAB = { STORAGE_AREAS: 'storage-areas', ROOMS: 'rooms' } as const;
const TAB_LABEL = { STORAGE_AREAS: 'Storage Areas', ROOMS: 'Rooms' } as const;

const COPY = {
  LIST: { TITLE: LIST_TITLE, EMPTY_MESSAGE: EMPTY_LIST_MESSAGE },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Storage Area',
    DESCRIPTION:
      'Add details manually, or upload photos and analyze them to suggest tags.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Storage Area',
    DESCRIPTION: '',
  },
};

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

const WhereIsListItem = ({ item }: { item: WhereIsFormValues }) => {
  const roomName = findRoomName(useWhereIsRooms()?.rooms ?? [], item.roomId);
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <Text weight="bold" size="2" as="p">
          {item.title}
        </Text>
        {roomName && (
          <Badge variant="outline" size="1">
            {roomName}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {sortTags(item.tags).map(tag => (
          <Badge key={tag} variant="soft" size="1">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

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
  const [tab, setTab] = useState<string>(TAB.STORAGE_AREAS);
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
  const onRoomCreated = useCallback(
    (room: WhereIsRoom) => setRooms(prev => sortRooms([...prev, room])),
    [],
  );
  const roomsContext = useMemo(
    () => ({
      rooms,
      homeId: selectedHomeId ?? undefined,
      onRoomCreated,
      onEditStart,
      onEditEnd,
    }),
    [rooms, selectedHomeId, onRoomCreated, onEditStart, onEditEnd],
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

  const filtered = items.filter(item => {
    // An open form keeps its row matched by the room it opened with, so a room change does not unmount the dialog.
    const roomId = pinnedRoomIds.has(item.id)
      ? pinnedRoomIds.get(item.id)
      : item.roomId;
    return fuzzyMatch(query, item, findRoomName(rooms, roomId ?? null));
  });

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

  const handleRoomDeleted = (roomId: string) => {
    setItems(prev =>
      prev.map(item =>
        item.roomId === roomId ? { ...item, roomId: null } : item,
      ),
    );
  };

  const renderList = (onItemClick: (item: { id: string }) => void) => (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value={TAB.STORAGE_AREAS}>
            {TAB_LABEL.STORAGE_AREAS}
          </TabsTrigger>
          <TabsTrigger value={TAB.ROOMS}>{TAB_LABEL.ROOMS}</TabsTrigger>
        </TabsList>
        {tab === TAB.STORAGE_AREAS ? (
          <CRUDItemFormDialog<WhereIsFormValues>
            formType={FORM_TYPE.CREATE}
            initialFormValues={DEFAULT_FORM}
            FormComponent={WhereIsFormComponent as never}
            submitHandler={async form => {
              const created = await createItem(form);
              setItems(prev => [...prev, created as never]);
            }}
            copy={COPY}
            createLabel={CREATE_LABEL}
            showCloseButton
          />
        ) : (
          <CreateRoomButton homeId={selectedHomeId} setRooms={setRooms} />
        )}
      </div>

      <TabsContent value={TAB.STORAGE_AREAS} className="space-y-6">
        {!loaded ? (
          <ListSkeleton />
        ) : (
          <CRUDItemList
            items={filtered.map(toFormItem) as never}
            setItems={setItems as never}
            updateItem={updateItem as never}
            deleteItem={deleteItem}
            FormComponent={WhereIsFormComponent as never}
            ListItemComponent={WhereIsListItem as never}
            compact
            copy={COPY}
            search={{
              value: query,
              onChange: setQuery,
              placeholder: SEARCH_PLACEHOLDER,
            }}
            getItemImages={(item: WhereIsFormValues) =>
              item.thumbnailUrl ? [item.thumbnailUrl] : []
            }
            getItemTitle={(item: { title: string }) => item.title}
            onItemClick={onItemClick}
            leadingItemActions={item => [
              {
                label: VIEW_DETAILS_LABEL,
                icon: <Eye size={16} />,
                onSelect: () => onItemClick(item),
              },
            ]}
            showDialogCloseButton
          />
        )}
      </TabsContent>

      <TabsContent value={TAB.ROOMS}>
        <ManageRooms
          rooms={rooms}
          setRooms={setRooms}
          onRoomDeleted={handleRoomDeleted}
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <WhereIsRoomsContext.Provider value={roomsContext}>
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
