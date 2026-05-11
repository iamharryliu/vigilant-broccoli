'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flex, Text, TextField, TextArea } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { HouseholdRule } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

const DEFAULT_FORM: HouseholdRule = {
  id: '',
  name: '',
  description: null,
  position: 0,
  homeId: 0,
  createdAt: '',
  updatedAt: '',
};

const COPY = {
  LIST: { TITLE: 'Household Rules', EMPTY_MESSAGE: 'No rules yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Rule',
    DESCRIPTION: 'Add a new household rule.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Rule',
    DESCRIPTION: 'Edit the household rule.',
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });

const RuleListItem = ({
  item,
  ellipsis,
}: {
  item: HouseholdRule;
  ellipsis?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
    <div className="flex items-start gap-3 min-w-0">
      <Text size="1" color="gray" className="shrink-0 pt-0.5">
        #{item.position}
      </Text>
      <div className="min-w-0">
        <Text size="2" weight="medium" as="p">
          {item.name}
        </Text>
        {item.description && (
          <Text size="1" color="gray" as="p">
            {item.description}
          </Text>
        )}
        <Text size="1" color="gray" as="p">
          Created {formatDate(item.createdAt)}
        </Text>
      </div>
    </div>
    {ellipsis}
  </div>
);

const RuleForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<HouseholdRule>) => {
  const [name, setName] = useState(initialFormValues.name);
  const [description, setDescription] = useState(
    initialFormValues.description ?? '',
  );
  const [position, setPosition] = useState(initialFormValues.position);

  return (
    <Flex direction="column" gap="3" mt="3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Name
        </Text>
        <TextField.Root
          placeholder="Rule name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <TextArea
          placeholder="Optional description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Position
        </Text>
        <TextField.Root
          type="number"
          min="0"
          value={position.toString()}
          onChange={e =>
            setPosition(Math.max(0, parseInt(e.target.value) || 0))
          }
        />
      </div>
      <Button
        onClick={async () =>
          submitHandler(
            {
              ...initialFormValues,
              name,
              description: description || null,
              position,
            },
            formType,
          )
        }
      >
        {formType === FORM_TYPE.UPDATE ? 'Save' : 'Add Rule'}
      </Button>
    </Flex>
  );
};

interface Props {
  rules: HouseholdRule[];
  setRules: React.Dispatch<React.SetStateAction<HouseholdRule[]>>;
  homeId: string | number;
  onCreate: (form: HouseholdRule) => Promise<HouseholdRule>;
  onUpdate: (form: HouseholdRule) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
}

export function HouseholdRuleList({
  rules,
  setRules,
  homeId,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const router = useRouter();
  const nextPosition = useRef(
    rules.length > 0 ? Math.max(...rules.map(r => r.position)) + 1 : 0,
  );

  return (
    <CRUDItemList
      items={rules}
      setItems={setRules}
      createItem={onCreate}
      createItemFormDefaultValues={{
        ...DEFAULT_FORM,
        homeId: Number(homeId),
        position: nextPosition.current,
      }}
      updateItem={onUpdate}
      deleteItem={onDelete}
      FormComponent={RuleForm}
      ListItemComponent={RuleListItem as never}
      copy={COPY}
      onItemClick={(item) => router.push(ROUTES.HOUSEHOLD_RULES_DETAIL(item.id))}
    />
  );
}
