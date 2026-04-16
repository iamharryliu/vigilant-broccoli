'use client';

import { useState } from 'react';
import { Badge, Button, Flex, Select, Text, TextField } from '@radix-ui/themes';
import { CRUDItemList, CRUDFormProps } from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { HOME_ROLE, HomeMember, HomeRole } from '../../../lib/types';

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
  role: HOME_ROLE.MEMBER,
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

const MemberListItem = ({
  item,
  isOwner,
  onRoleChange,
}: {
  item: HomeMember;
  isOwner: boolean;
  onRoleChange: (memberId: string, role: HomeRole) => Promise<void>;
}) => (
  <Flex align="center" gap="3">
    <Flex align="center" gap="2">
      <Text size="2">{item.email}</Text>
      <Badge
        variant="soft"
        color={item.status === 'accepted' ? 'green' : 'orange'}
        size="1"
      >
        {item.status}
      </Badge>
    </Flex>
    <div className="flex-1" />
    {item.status === 'accepted' && isOwner ? (
      <Select.Root
        value={item.role}
        onValueChange={v => onRoleChange(item.id, v as HomeRole)}
        size="1"
      >
        <Select.Trigger onClick={e => e.stopPropagation()} />
        <Select.Content>
          <Select.Item value={HOME_ROLE.MEMBER}>Member</Select.Item>
          <Select.Item value={HOME_ROLE.ADMIN}>Admin</Select.Item>
        </Select.Content>
      </Select.Root>
    ) : (
      <Badge variant="outline" size="1">
        {item.role}
      </Badge>
    )}
  </Flex>
);

type Props = {
  members: HomeMember[];
  setMembers: React.Dispatch<React.SetStateAction<HomeMember[]>>;
  isOwner: boolean;
  onInvite: (member: HomeMember) => Promise<HomeMember>;
  onDelete: (memberId: string | number) => Promise<void>;
  onRoleChange: (memberId: string, role: HomeRole) => Promise<void>;
};

export const MemberList = ({
  members,
  setMembers,
  isOwner,
  onInvite,
  onDelete,
  onRoleChange,
}: Props) => (
  <CRUDItemList
    items={members}
    setItems={setMembers}
    createItem={isOwner ? onInvite : undefined}
    createItemFormDefaultValues={DEFAULT_MEMBER}
    deleteItem={isOwner ? onDelete : undefined}
    FormComponent={MemberFormComponent}
    ListItemComponent={({ item }) => (
      <MemberListItem
        item={item}
        isOwner={isOwner}
        onRoleChange={onRoleChange}
      />
    )}
    copy={MEMBER_COPY}
  />
);
