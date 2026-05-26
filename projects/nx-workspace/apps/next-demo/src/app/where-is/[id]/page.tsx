'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Flex, Text } from '@radix-ui/themes';
import {
  CRUDItemFormDialog,
  EllipsisCTA,
  StackedImages,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useAuth } from '../../providers/auth-provider';
import { WhereIsItem } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';
import { WhereIsFormComponent, WhereIsFormValues } from '../where-is-form';

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
      <Flex align="center" justify="between">
        <Text size="6" weight="bold">
          {item.title}
        </Text>
        <EllipsisCTA
          onUpdate={() => setUpdateOpen(true)}
          onDelete={handleDelete}
        />
      </Flex>

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

      {item.tags.length > 0 && (
        <Flex gap="2" wrap="wrap">
          {item.tags.map(tag => (
            <Badge key={tag} variant="soft" size="2">
              {tag}
            </Badge>
          ))}
        </Flex>
      )}

      {item.imageUrls.length > 0 && (
        <>
          <StackedImages urls={item.imageUrls} alt={item.title} size={120} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${item.title} ${i + 1}`}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </>
      )}

      <Text size="1" color="gray" as="p">
        Added{' '}
        {new Date(item.createdAt).toLocaleDateString(undefined, {
          dateStyle: 'medium',
        })}
      </Text>
    </div>
  );
}
