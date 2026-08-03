'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge, Text } from '@radix-ui/themes';
import {
  CRUDItemFormDialog,
  EllipsisCTA,
  ImageCarouselDialog,
  ImageFilmstrip,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../../providers/auth-provider';
import { WhereIsItem } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';
import { WhereIsFormComponent, WhereIsFormValues } from '../where-is-form';
import { WhereIsLabel } from '../where-is-label';

const WHERE_IS_COPY = {
  LIST: { TITLE: 'Storage Areas', EMPTY_MESSAGE: '' },
  [FORM_TYPE.CREATE]: { TITLE: 'Add Storage Area', DESCRIPTION: '' },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Storage Area',
    DESCRIPTION: 'Edit the title, description, and tags.',
  },
};

export default function WhereIsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const session = useAuth();
  const [item, setItem] = useState<WhereIsItem | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/where-is?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setItem);
  }, [id, session?.access_token]);

  const handleUpdate = async (form: WhereIsFormValues) => {
    await fetch('/api/where-is', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        description: form.description,
        tags: form.tags,
      }),
    });
    setItem(prev =>
      prev
        ? {
            ...prev,
            title: form.title,
            description: form.description,
            tags: form.tags,
          }
        : prev,
    );
  };

  const handleDelete = async () => {
    if (!item || !session?.access_token) return;
    await fetch('/api/where-is', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: item.id }),
    });
    router.push(ROUTES.WHERE_IS);
  };

  if (!item) return null;

  const formValues: WhereIsFormValues = {
    id: item.id,
    title: item.title,
    description: item.description,
    tags: item.tags,
    images: [],
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="print:hidden space-y-6">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href={ROUTES.WHERE_IS} className="hover:text-gray-700">
            Storage Areas
          </Link>
          <ChevronRight size={14} />
          <Text size="2" color="gray" className="truncate">
            {item.title}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <Text size="6" weight="bold">
            {item.title}
          </Text>
          <EllipsisCTA
            onUpdate={() => setUpdateOpen(true)}
            onDelete={handleDelete}
          />
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
}
