'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  CRUDItemList,
  Input,
  Text,
  Badge,
  cn,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhereIsItem } from '../../lib/types';
import { ROUTES, WHERE_IS_ITEM_PARAM } from '../../lib/routes';
import {
  WhereIsFormComponent,
  WhereIsFormValues,
  PreviewImage,
} from './where-is-form';
import { uploadPreviewImages } from './upload-images';
import { WhereIsDetailPanel } from './where-is-detail-panel';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

const WHERE_IS_ENDPOINT = '/api/where-is';

const DEFAULT_FORM: WhereIsFormValues = {
  id: '',
  title: '',
  description: '',
  tags: [],
  images: [],
};

const COPY = {
  LIST: { TITLE: 'Storage Areas', EMPTY_MESSAGE: 'No storage areas yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Storage Area',
    DESCRIPTION: 'Upload photos of a storage area to identify its contents.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Storage Area',
    DESCRIPTION: 'Edit the title, description, and tags.',
  },
};

const fuzzyMatch = (query: string, item: WhereIsItem): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const searchText = [item.title, item.description, ...item.tags]
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
      {item.tags.map(tag => (
        <Badge key={tag} variant="soft" size="1">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

function WhereIsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useAuth();
  const { selectedHomeId } = useHome();
  const [items, setItems] = useState<WhereIsItem[]>([]);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  const selectedItemId = searchParams.get(WHERE_IS_ITEM_PARAM);

  useEffect(() => {
    if (selectedHomeId === null) return;
    setLoaded(false);
    fetch(`${WHERE_IS_ENDPOINT}?homeId=${selectedHomeId}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    })
      .then(r => r.json())
      .then(data => {
        setItems(data);
        setLoaded(true);
      });
  }, [selectedHomeId, session?.access_token]);

  const createItem = async (
    form: WhereIsFormValues,
  ): Promise<WhereIsFormValues> => {
    const { description, tags } = form;
    const accessToken = session?.access_token ?? '';
    const images = await uploadPreviewImages(form.images, accessToken);

    await fetch(WHERE_IS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: form.title,
        description,
        tags,
        homeId: selectedHomeId,
        userId: session?.user.id,
        images,
      }),
    });

    const res = await fetch(`${WHERE_IS_ENDPOINT}?homeId=${selectedHomeId}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    });
    const updated: WhereIsItem[] = await res.json();
    const newItem = updated[0];

    return {
      id: newItem?.id ?? '',
      title: newItem?.title ?? form.title,
      description: newItem?.description ?? description,
      tags: newItem?.tags ?? tags,
      images: [],
      imageUrls: newItem?.imageUrls ?? [],
      imageKeys: newItem?.imageKeys ?? [],
    } as WhereIsFormValues & Pick<WhereIsItem, 'imageUrls' | 'imageKeys'>;
  };

  const updateItem = async (form: WhereIsFormValues): Promise<void> => {
    const original = items.find(i => i.id === form.id);
    const removedImageKeys = (original?.imageKeys ?? []).filter(
      key => !(form.imageKeys ?? []).includes(key),
    );
    const accessToken = session?.access_token ?? '';
    const newImages = await uploadPreviewImages(form.images, accessToken);

    await fetch(WHERE_IS_ENDPOINT, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        description: form.description,
        tags: form.tags,
        removedImageKeys,
        newImages,
      }),
    });
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

  const filtered = items.filter(item => fuzzyMatch(query, item));

  const formItems = filtered.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    images: [] as PreviewImage[],
    imageUrls: item.imageUrls,
    imageKeys: item.imageKeys,
    createdAt: item.createdAt,
  }));

  const renderList = (onItemClick: (item: { id: string }) => void) =>
    loaded && (
      <>
        <Input
          placeholder="Search items (e.g. scissors, batteries)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <CRUDItemList
          items={formItems as never}
          setItems={setItems as never}
          createItem={createItem as never}
          createItemFormDefaultValues={DEFAULT_FORM}
          updateItem={updateItem as never}
          deleteItem={deleteItem}
          FormComponent={WhereIsFormComponent as never}
          ListItemComponent={WhereIsListItem as never}
          copy={COPY}
          getItemImages={(item: { imageUrls?: string[] }) => item.imageUrls}
          getItemTitle={(item: { title: string }) => item.title}
          onItemClick={onItemClick}
        />
      </>
    );

  return (
    <>
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
    </>
  );
}

export default function WhereIsPage() {
  usePageTitle(PAGE_TITLES.WHERE_IS);
  return (
    <Suspense fallback={null}>
      <WhereIsPageContent />
    </Suspense>
  );
}
