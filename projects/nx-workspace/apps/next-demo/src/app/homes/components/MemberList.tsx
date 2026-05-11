'use client';

import { ReactNode, useState } from 'react';
import { Badge, Button, Flex, Select, Text, TextField } from '@radix-ui/themes';
import {
  CRUDItemList,
  CRUDFormProps,
  Avatar,
  AvatarFallback,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { HOME_ROLE, HomeMember, HomeRole } from '../../../lib/types';

const ROLE_LABEL: Record<string, string> = {
  [HOME_ROLE.OWNER]: 'Owner',
  [HOME_ROLE.ADMIN]: 'Admin',
  [HOME_ROLE.MEMBER]: 'Member',
};

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
  const [role, setRole] = useState<HomeRole>(initialFormValues.role);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    await submitHandler({ ...initialFormValues, email, role }, formType);
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
      {formType === FORM_TYPE.UPDATE && (
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Role
          </Text>
          <Select.Root
            value={role}
            onValueChange={v => setRole(v as HomeRole)}
            size="2"
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value={HOME_ROLE.MEMBER}>
                {ROLE_LABEL[HOME_ROLE.MEMBER]}
              </Select.Item>
              <Select.Item value={HOME_ROLE.ADMIN}>
                {ROLE_LABEL[HOME_ROLE.ADMIN]}
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      )}
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
  ellipsis,
}: {
  item: HomeMember;
  ellipsis?: ReactNode;
}) => {
  const isItemOwner = item.role === HOME_ROLE.OWNER;
  return (
    <Flex align="center" justify="between" width="100%">
      <Flex align="center" gap="2">
        <Avatar>
          <AvatarFallback>{item.email[0]?.toUpperCase() ?? '?'}</AvatarFallback>
        </Avatar>
        <Text size="2">{item.email}</Text>
        {!isItemOwner && item.status === 'pending' && (
          <Badge variant="soft" color="orange" size="1">
            pending
          </Badge>
        )}
      </Flex>
      <Flex align="center" gap="2">
        <Badge variant="soft" color={isItemOwner ? 'blue' : 'gray'} size="1">
          {ROLE_LABEL[item.role] ?? item.role}
        </Badge>
        {!isItemOwner && ellipsis}
      </Flex>
    </Flex>
  );
};

type Props = {
  members: HomeMember[];
  setMembers: React.Dispatch<React.SetStateAction<HomeMember[]>>;
  isOwner: boolean;
  isAdmin: boolean;
  onInvite: (member: HomeMember) => Promise<HomeMember>;
  onDelete: (memberId: string | number) => Promise<void>;
  onRoleChange: (memberId: string, role: HomeRole) => Promise<void>;
};

export const MemberList = ({
  members,
  setMembers,
  isOwner,
  isAdmin,
  onInvite,
  onDelete,
  onRoleChange,
}: Props) => (
  <CRUDItemList
    items={members}
    setItems={setMembers}
    createItem={isOwner ? onInvite : undefined}
    createItemFormDefaultValues={DEFAULT_MEMBER}
    updateItem={
      isOwner
        ? async (member: HomeMember) => {
            await onRoleChange(member.id, member.role);
          }
        : undefined
    }
    deleteItem={isOwner ? onDelete : undefined}
    FormComponent={MemberFormComponent}
    ListItemComponent={({ item, ellipsis }) => (
      <MemberListItem item={item} ellipsis={ellipsis} />
    )}
    copy={MEMBER_COPY}
    showEllipsis={isOwner}
  />
);
