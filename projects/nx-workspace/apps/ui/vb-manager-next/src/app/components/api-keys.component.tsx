'use client';
import {
  Badge,
  Button,
  Callout,
  Checkbox,
  Code,
  Flex,
  Switch,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { CardContainer } from '@vigilant-broccoli/react-lib';
import { VB_EXPRESS_SERVICE } from '@vigilant-broccoli/common-js';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const TITLE = 'API Keys';
const FETCH_ERROR = 'Failed to fetch API keys';
const MINT_ERROR = 'Failed to mint API key';
const UPDATE_ERROR = 'Failed to update API key';
const DELETE_ERROR = 'Failed to delete API key';
const DELETE_CONFIRM = 'Delete this API key? This cannot be undone.';
const SHOW_ONCE_NOTICE =
  'Copy this key now — it is only shown once and cannot be recovered.';
const DEFAULT_EMAIL = 'harryliu1995@gmail.com';
const ALL_SERVICES = Object.values(VB_EXPRESS_SERVICE);
const NEVER = 'never';
const COPY = 'Copy';
const COPIED = 'Copied!';

interface ApiKeySummary {
  id: string;
  name: string | null;
  start: string | null;
  services: string[];
  enabled: boolean;
  createdAt: string;
  lastRequest: string | null;
  email: string | null;
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : NEVER;

export const ApiKeysComponent = () => {
  const [keys, setKeys] = useState<ApiKeySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [services, setServices] = useState<string[]>(ALL_SERVICES);
  const [minting, setMinting] = useState(false);
  const [mintedKey, setMintedKey] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState(COPY);

  const fetchKeys = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.API_KEYS);
      if (!response.ok) throw new Error(FETCH_ERROR);
      const data = await response.json();
      setKeys(data.keys);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : FETCH_ERROR);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const toggleService = (service: string) => {
    setServices(current =>
      current.includes(service)
        ? current.filter(item => item !== service)
        : [...current, service],
    );
  };

  const mintKey = async () => {
    setMinting(true);
    setMintedKey(null);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEYS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, services }),
      });
      if (!response.ok) throw new Error(MINT_ERROR);
      const data = await response.json();
      setMintedKey(data.key);
      setCopyLabel(COPY);
      setName('');
      setError(null);
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : MINT_ERROR);
    } finally {
      setMinting(false);
    }
  };

  const toggleKey = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_KEYS}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error(UPDATE_ERROR);
      setError(null);
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : UPDATE_ERROR);
    }
  };

  const deleteKey = async (id: string) => {
    if (!window.confirm(DELETE_CONFIRM)) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.API_KEYS}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(DELETE_ERROR);
      setError(null);
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : DELETE_ERROR);
    }
  };

  const copyMintedKey = async () => {
    if (!mintedKey) return;
    await navigator.clipboard.writeText(mintedKey);
    setCopyLabel(COPIED);
  };

  if (keys === null && !error) return <CardSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      <CardContainer title={TITLE}>
        {error && (
          <Callout.Root color="red">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <Flex direction="column" gap="2">
          <Flex gap="2" wrap="wrap">
            <TextField.Root
              placeholder="Key name (e.g. hearth)"
              value={name}
              onChange={event => setName(event.target.value)}
              className="grow"
            />
            <TextField.Root
              placeholder="Account email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="grow"
            />
          </Flex>
          <Flex gap="3" wrap="wrap">
            {ALL_SERVICES.map(service => (
              <Text key={service} size="1" as="label">
                <Flex gap="1" align="center">
                  <Checkbox
                    checked={services.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  {service}
                </Flex>
              </Text>
            ))}
          </Flex>
          <Flex gap="2">
            <Button
              onClick={mintKey}
              disabled={minting || !name || !email || !services.length}
            >
              Mint key
            </Button>
            <Button
              variant="soft"
              onClick={() =>
                setServices(
                  services.length === ALL_SERVICES.length ? [] : ALL_SERVICES,
                )
              }
            >
              Toggle all services
            </Button>
          </Flex>
          {mintedKey && (
            <Callout.Root color="green">
              <Callout.Text>
                <Flex direction="column" gap="1">
                  <Text size="1">{SHOW_ONCE_NOTICE}</Text>
                  <Flex gap="2" align="center">
                    <Code className="break-all">{mintedKey}</Code>
                    <Button size="1" variant="soft" onClick={copyMintedKey}>
                      {copyLabel}
                    </Button>
                  </Flex>
                </Flex>
              </Callout.Text>
            </Callout.Root>
          )}
        </Flex>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Account</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Services</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Last used</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Enabled</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(keys ?? []).map(key => (
              <Table.Row key={key.id}>
                <Table.Cell>
                  <Text weight="medium">{key.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Code size="1">{key.start}…</Code>
                </Table.Cell>
                <Table.Cell>
                  <Text size="1">{key.email}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="1" wrap="wrap">
                    {key.services.length === ALL_SERVICES.length ? (
                      <Badge color="blue" size="1">
                        all services
                      </Badge>
                    ) : (
                      key.services.map(service => (
                        <Badge key={service} size="1">
                          {service}
                        </Badge>
                      ))
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="1">{formatDate(key.lastRequest)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="1">{formatDate(key.createdAt)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Switch
                    checked={key.enabled}
                    onCheckedChange={checked => toggleKey(key.id, checked)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="1"
                    color="red"
                    variant="soft"
                    onClick={() => deleteKey(key.id)}
                  >
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </CardContainer>
    </div>
  );
};
