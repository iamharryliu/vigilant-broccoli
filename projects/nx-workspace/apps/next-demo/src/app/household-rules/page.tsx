'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flex, Text, TextField, TextArea } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { HouseholdRule } from '../../lib/types';

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

const RuleListItem = ({
  item,
  ellipsis,
}: {
  item: HouseholdRule;
  ellipsis?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-200 bg-white">
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

export default function HouseholdRulesPage() {
  const router = useRouter();
  const session = useAuth();
  const [homeId, setHomeId] = useState<number | null>(null);
  const [rules, setRules] = useState<HouseholdRule[]>([]);
  const nextPosition = useRef(0);

  const token = session?.access_token ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  useEffect(() => {
    supabase
      .from('homes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.replace(ROUTES.HOMES);
          return;
        }
        setHomeId(data.id);
      });
  }, [router]);

  const fetchRules = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/household-rules?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    const list: HouseholdRule[] = Array.isArray(data) ? data : [];
    setRules(list);
    nextPosition.current =
      list.length > 0 ? Math.max(...list.map(r => r.position)) + 1 : 0;
  }, [homeId, token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (form: HouseholdRule): Promise<HouseholdRule> => {
    const res = await fetch('/api/household-rules', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        homeId,
        position: form.position ?? nextPosition.current,
      }),
    });
    return res.json();
  };

  const updateRule = async (form: HouseholdRule): Promise<void> => {
    await fetch('/api/household-rules', {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        description: form.description,
        position: form.position,
      }),
    });
  };

  const deleteRule = async (id: string | number): Promise<void> => {
    await fetch('/api/household-rules', {
      method: 'DELETE',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  if (!homeId) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <CRUDItemList
        items={rules}
        setItems={setRules}
        createItem={createRule}
        createItemFormDefaultValues={{
          ...DEFAULT_FORM,
          homeId,
          position: nextPosition.current,
        }}
        updateItem={updateRule}
        deleteItem={deleteRule}
        FormComponent={RuleForm}
        ListItemComponent={RuleListItem as never}
        copy={COPY}
      />
    </div>
  );
}
