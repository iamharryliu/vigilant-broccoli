'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import {
  Badge,
  CRUDItemFormDialog,
  EllipsisCTA,
  ImageCarouselDialog,
  ImageFilmstrip,
  Text,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { WhereIsItem } from '../../lib/types';
import { ROUTES } from '../../lib/routes';
import { WhereIsFormComponent, WhereIsFormValues } from './where-is-form';
import { WhereIsLabel } from './where-is-label';
import { uploadPreviewImages } from './upload-images';

const WHERE_IS_ENDPOINT = '/api/where-is';

const WHERE_IS_COPY = {
  LIST: { TITLE: 'Storage Areas', EMPTY_MESSAGE: '' },
  [FORM_TYPE.CREATE]: { TITLE: 'Add Storage Area', DESCRIPTION: '' },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Storage Area',
    DESCRIPTION: 'Edit the title, description, and tags.',
  },
};

type Props = {
  id: string;
  variant: 'page' | 'panel';
  onClose?: () => void;
  onUpdated?: (item: WhereIsItem) => void;
  onDeleted?: () => void;
};

export const WhereIsDetail = ({
  id,
  variant,
  onClose,
  onUpdated,
  onDeleted,
}: Props) => {
  const session = useAuth();
  const [item, setItem] = useState<WhereIsItem | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    setItem(null);
    fetch(`${WHERE_IS_ENDPOINT}?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setItem);
  }, [id, session?.access_token]);

  const handleUpdate = async (form: WhereIsFormValues) => {
    const removedImageUrls = (item?.imageUrls ?? []).filter(
      url => !(form.imageUrls ?? []).includes(url),
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
        removedImageUrls,
        newImages,
      }),
    });

    const res = await fetch(`${WHERE_IS_ENDPOINT}?id=${form.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const updated: WhereIsItem = await res.json();
    setItem(updated);
    onUpdated?.(updated);
  };

  const handleDelete = async () => {
    if (!item || !session?.access_token) return;
    await fetch(WHERE_IS_ENDPOINT, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: item.id }),
    });
    onDeleted?.();
  };

  if (!item) return null;

  const formValues: WhereIsFormValues = {
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    images: [],
    imageUrls: item.imageUrls,
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden space-y-6">
        {variant === 'page' && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Link href={ROUTES.WHERE_IS} className="hover:text-gray-700">
              Storage Areas
            </Link>
            <ChevronRight size={14} />
            <Text size="2" color="gray" className="truncate">
              {item.title}
            </Text>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Text size="6" weight="bold" className="truncate">
            {item.title}
          </Text>
          <div className="flex items-center gap-1 shrink-0">
            <EllipsisCTA
              onUpdate={() => setUpdateOpen(true)}
              onDelete={handleDelete}
            />
            {variant === 'panel' && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-sm p-1.5 opacity-70 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <CRUDItemFormDialog
          open={updateOpen}
          onOpenChange={setUpdateOpen}
          formType={FORM_TYPE.UPDATE}
          initialFormValues={formValues}
          FormComponent={WhereIsFormComponent as never}
          submitHandler={handleUpdate as never}
          copy={WHERE_IS_COPY}
        />

        {item.description && (
          <Text size="3" color="gray" as="p">
            {item.description}
          </Text>
        )}

        <Text size="1" color="gray" as="p">
          Added{' '}
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            dateStyle: 'medium',
          })}
        </Text>

        {item.imageUrls.length > 0 && (
          <>
            <ImageFilmstrip
              urls={item.imageUrls}
              alt={item.title}
              onSelect={setCarouselIndex}
            />
            <ImageCarouselDialog
              images={item.imageUrls}
              initialIndex={carouselIndex ?? 0}
              open={carouselIndex !== null}
              onOpenChange={open => !open && setCarouselIndex(null)}
              alt={item.title}
            />
          </>
        )}

        {item.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {item.tags.map(tag => (
              <Badge key={tag} variant="soft" size="2">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <WhereIsLabel itemId={item.id} title={item.title} />
    </div>
  );
};
