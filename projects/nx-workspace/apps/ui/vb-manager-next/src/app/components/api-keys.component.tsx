'use client';
import { Badge, Callout, Code, Flex, Text } from '@radix-ui/themes';
import {
  Button,
  Checkbox,
  CRUDFormProps,
  CRUDItemList,
  Input,
  MonospaceText,
  Switch,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE, VB_EXPRESS_SERVICE } from '@vigilant-broccoli/common-js';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const ALL_SERVICES = Object.values(VB_EXPRESS_SERVICE);
const DEFAULT_EMAIL = 'harryliu1995@gmail.com';
const SEED_KEY_NAME = 'legacy-shared';
const KEY_START_LENGTH = 6;
const NEVER = 'never';
const FETCH_ERROR = 'Failed to fetch API keys';
const CREATE_ERROR = 'Failed to create API key';
const UPDATE_ERROR = 'Failed to update API key';
const DELETE_ERROR = 'Failed to delete API key';
const SHOW_ONCE_NOTICE =
  'Copy this key now — it is only shown once and cannot be recovered.';
const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No API keys.';

const LIST_COPY = {
  LIST: {
    TITLE: 'API Keys',
    EMPTY_MESSAGE,
  },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Create API Key',
    DESCRIPTION: 'The key value is shown once after creation.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update API Key',
    DESCRIPTION: 'Rename the key or change its service access.',
  },
};

interface ApiKeyItem {
  id: string;
  name: string;
  email: string;
  services: string[];
  start: string | null;
  enabled: boolean;
  createdAt: string | null;
  lastRequest: string | null;
}

const CREATE_FORM_DEFAULT_VALUES: ApiKeyItem = {
  id: '',
  name: '',
  email: DEFAULT_EMAIL,
  services: ALL_SERVICES,
  start: null,
  enabled: true,
  createdAt: null,
  lastRequest: null,
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : NEVER;

export const ApiKeysComponent = () => {
  const [items, setItems] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mintedKey, setMintedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.API_KEYS);
        if (!response.ok) throw new Error(FETCH_ERROR);
        const data = await response.json();
        setItems(data.keys);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : FETCH_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, []);

  const createItem = async (item: ApiKeyItem) => {
    const response = await fetch(API_ENDPOINTS.API_KEYS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: item.email,
        name: item.name,
        services: item.services,
      }),
    });
    if (!response.ok) throw new Error(CREATE_ERROR);
    const data = await response.json();
    setMintedKey(data.key);
    setError(null);
    return {
      ...item,
      id: data.id,
      start: data.key.slice(0, KEY_START_LENGTH),
      createdAt: new Date().toISOString(),
    };
  };

  const updateItem = async (item: ApiKeyItem) => {
    const response = await fetch(`${API_ENDPOINTS.API_KEYS}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item.name, services: item.services }),
    });
    if (!response.ok) {
      setError(UPDATE_ERROR);
      throw new Error(UPDATE_ERROR);
    }
    setError(null);
  };

  const deleteItem = async (id: string | number) => {
    const response = await fetch(`${API_ENDPOINTS.API_KEYS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      setError(DELETE_ERROR);
      throw new Error(DELETE_ERROR);
    }
    setError(null);
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    const response = await fetch(`${API_ENDPOINTS.API_KEYS}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!response.ok) {
      setError(UPDATE_ERROR);
      return;
    }
    setError(null);
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, enabled } : item)),
    );
  };

  const ApiKeyListItem = ({ item }: { item: ApiKeyItem }) => (
    <Flex justify="between" align="center" gap="3" wrap="wrap">
      <Flex direction="column" gap="1">
        <Flex gap="2" align="center" wrap="wrap">
          <Text weight="medium">{item.name}</Text>
          <Code size="1">{item.start}…</Code>
          <Text size="1" color="gray">
            {item.email}
          </Text>
        </Flex>
        <Flex gap="1" wrap="wrap">
          {item.services.length === ALL_SERVICES.length ? (
            <Badge color="blue" size="1">
              all services
            </Badge>
          ) : (
            item.services.map(service => (
              <Badge key={service} size="1">
                {service}
              </Badge>
            ))
          )}
        </Flex>
        <Text size="1" color="gray">
          Last used: {formatDate(item.lastRequest)} · Created:{' '}
          {formatDate(item.createdAt)}
        </Text>
      </Flex>
      <Switch
        checked={item.enabled}
        onCheckedChange={checked => toggleEnabled(item.id, checked)}
      />
    </Flex>
  );

  return (
    <Flex direction="column" gap="4">
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      {mintedKey && (
        <Callout.Root color="green">
          <Callout.Text>
            <Flex direction="column" gap="1">
              <Text size="1">{SHOW_ONCE_NOTICE}</Text>
              <MonospaceText text={mintedKey} />
            </Flex>
          </Callout.Text>
        </Callout.Root>
      )}
      <CRUDItemList
        items={items}
        setItems={setItems}
        ListItemComponent={ApiKeyListItem}
        FormComponent={ApiKeyForm}
        createItem={createItem}
        createItemFormDefaultValues={CREATE_FORM_DEFAULT_VALUES}
        updateItem={updateItem}
        deleteItem={deleteItem}
        canShowEllipsis={item => item.name !== SEED_KEY_NAME}
        copy={{
          ...LIST_COPY,
          LIST: {
            ...LIST_COPY.LIST,
            EMPTY_MESSAGE: loading ? LOADING_MESSAGE : EMPTY_MESSAGE,
          },
        }}
        isCards
      />
    </Flex>
  );
};

const ApiKeyForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<ApiKeyItem>) => {
  const [item, setItem] = useState(initialFormValues);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleService = (service: string) => {
    setItem(current => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter(entry => entry !== service)
        : [...current.services, service],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      await submitHandler(item, formType);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : CREATE_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex direction="column" gap="3" className="mt-3">
      {formError && (
        <Callout.Root color="red">
          <Callout.Text>{formError}</Callout.Text>
        </Callout.Root>
      )}
      <Input
        placeholder="Key name (e.g. hearth)"
        value={item.name}
        onChange={event => setItem({ ...item, name: event.target.value })}
      />
      {formType === FORM_TYPE.CREATE && (
        <Input
          placeholder="Account email"
          value={item.email}
          onChange={event => setItem({ ...item, email: event.target.value })}
        />
      )}
      <Flex gap="3" wrap="wrap">
        {ALL_SERVICES.map(service => (
          <Text key={service} size="1" as="label">
            <Flex gap="1" align="center">
              <Checkbox
                checked={item.services.includes(service)}
                onCheckedChange={() => toggleService(service)}
              />
              {service}
            </Flex>
          </Text>
        ))}
      </Flex>
      <Button
        variant="secondary"
        onClick={() =>
          setItem({
            ...item,
            services:
              item.services.length === ALL_SERVICES.length ? [] : ALL_SERVICES,
          })
        }
      >
        Toggle all services
      </Button>
      <Button
        onClick={handleSubmit}
        loading={submitting}
        disabled={!item.name || !item.email || !item.services.length}
        className="w-full"
      >
        Submit
      </Button>
    </Flex>
  );
};
