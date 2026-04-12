'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { CRUDItemList, CRUDFormProps } from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { supabase } from '../../../../libs/supabase';
import { useAuth } from '../../providers/auth-provider';
import { ROUTES } from '../../../lib/routes';
import { Home, HomeMember } from '../../../lib/types';

const MEMBER_COPY = {
  LIST: { TITLE: 'Members', EMPTY_MESSAGE: 'No members yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Invite Member',
    DESCRIPTION: 'Send an invite to a new member by email.',
  },
  [FORM_TYPE.UPDATE]: { TITLE: 'Update Member', DESCRIPTION: '' },
};

const DEFAULT_MEMBER: HomeMember = {
  id: '',
  email: '',
  status: 'pending',
  createdAt: '',
};

const MemberFormComponent = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<HomeMember>) => {
  const [email, setEmail] = useState(initialFormValues.email);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    await submitHandler({ ...initialFormValues, email }, formType);
    setSubmitting(false);
  };

  return (
    <Flex direction="column" gap="3" mt="3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Email
        </Text>
        <TextField.Root
          placeholder="member@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={formType === FORM_TYPE.UPDATE}
        />
      </div>
      {formType === FORM_TYPE.CREATE && (
        <Button
          onClick={handleSubmit}
          disabled={!email.trim() || submitting}
          loading={submitting}
          className="cursor-pointer"
        >
          Send Invite
        </Button>
      )}
    </Flex>
  );
};

const MemberListItem = ({ item }: { item: HomeMember }) => (
  <Flex align="center" gap="3">
    <Text size="2">{item.email}</Text>
    <Badge
      variant="soft"
      color={item.status === 'accepted' ? 'green' : 'orange'}
      size="1"
    >
      {item.status}
    </Badge>
  </Flex>
);

export default function HomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const session = useAuth();
  const [home, setHome] = useState<Home | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<HomeMember[]>([]);

  useEffect(() => {
    supabase
      .from('homes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHome(data);
        setName(data.name);
        setDescription(data.description ?? '');
      });
  }, [id, router]);

  useEffect(() => {
    fetch(`/api/homes/${id}/members`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    })
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data))
          setMembers(
            data.map(m => ({
              ...(m as HomeMember),
              createdAt: (m as HomeMember).createdAt ?? '',
            })),
          );
      });
  }, [id, session?.access_token]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/homes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        accessToken: session?.access_token,
      }),
    });
    setSaving(false);
  };

  const inviteMember = async (member: HomeMember): Promise<HomeMember> => {
    await fetch(`/api/homes/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: member.email,
        accessToken: session?.access_token,
      }),
    });
    const newMember: HomeMember = {
      id: crypto.randomUUID(),
      email: member.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return newMember;
  };

  const deleteMember = async (memberId: string | number) => {
    await fetch(`/api/homes/${id}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, accessToken: session?.access_token }),
    });
  };

  if (!home) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Flex align="center" gap="3">
        <button
          onClick={() => router.push(ROUTES.HOMES)}
          className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
        >
          ← Homes
        </button>
      </Flex>

      <div className="space-y-4">
        <Text size="6" weight="bold">
          Home Details
        </Text>
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Name
          </Text>
          <TextField.Root
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Home name"
          />
        </div>
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Description
          </Text>
          <TextField.Root
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
          />
        </div>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!name.trim()}
          className="cursor-pointer"
        >
          Save
        </Button>
      </div>

      <CRUDItemList
        items={members}
        setItems={setMembers}
        createItem={inviteMember}
        createItemFormDefaultValues={DEFAULT_MEMBER}
        deleteItem={deleteMember}
        FormComponent={MemberFormComponent}
        ListItemComponent={MemberListItem}
        copy={MEMBER_COPY}
      />
    </div>
  );
}
