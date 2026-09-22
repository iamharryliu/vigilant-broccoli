'use client';

import { FormEvent, useState } from 'react';
import {
  Button,
  Input,
  Select,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import {
  KITCHEN_PROJECT_LOCATIONS,
  KitchenProjectItem,
  KitchenProjectKind,
  KitchenProjectLocation,
} from '../../lib/types';
import { toDatetimeLocal } from '../../lib/date-utils';
import {
  DEFAULT_TEMPLATE,
  KIND_LABELS,
  KIND_OPTIONS,
  LOCATION_LABELS,
  PROJECT_TEMPLATES,
  ProjectTemplate,
} from './kitchen-projects.consts';

const NAME_PLACEHOLDER = 'Fried mushrooms, sourdough levain…';
const NOTES_PLACEHOLDER = 'Optional: quantity, hydration, who made it';
const SAVE_LABEL = 'Save';
const CANCEL_LABEL = 'Cancel';

export type KitchenProjectFormData = {
  name: string;
  kind: KitchenProjectKind;
  location: KitchenProjectLocation;
  notes: string;
  startedAt: string;
  readyAt: string | null;
  useByAt: string | null;
};

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--gray-6)',
  background: 'var(--color-background)',
  color: 'inherit',
  fontSize: '14px',
  width: '100%',
};

const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

const fromOffset = (offsetMs: number) =>
  toDatetimeLocal(new Date(Date.now() + offsetMs).toISOString());

type Props = {
  item?: KitchenProjectItem;
  onSubmit: (data: KitchenProjectFormData) => void;
  onCancel: () => void;
};

export function KitchenProjectForm({ item, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(item?.name ?? '');
  const [kind, setKind] = useState<KitchenProjectKind>(
    item?.kind ?? DEFAULT_TEMPLATE.kind,
  );
  const [location, setLocation] = useState<KitchenProjectLocation>(
    item?.location ?? DEFAULT_TEMPLATE.location,
  );
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [startedAt, setStartedAt] = useState(
    toDatetimeLocal(item?.startedAt ?? new Date().toISOString()),
  );
  const [readyAt, setReadyAt] = useState(
    item
      ? toDatetimeLocal(item.readyAt ?? '')
      : fromOffset(DEFAULT_TEMPLATE.readyInMs),
  );
  const [useByAt, setUseByAt] = useState(
    item
      ? toDatetimeLocal(item.useByAt ?? '')
      : fromOffset(DEFAULT_TEMPLATE.useByInMs),
  );

  const applyTemplate = (template: ProjectTemplate) => {
    if (template.name) setName(template.name);
    setKind(template.kind);
    setLocation(template.location);
    setStartedAt(toDatetimeLocal(new Date().toISOString()));
    setReadyAt(fromOffset(template.readyInMs));
    setUseByAt(fromOffset(template.useByInMs));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      kind,
      location,
      notes: notes.trim(),
      startedAt: new Date(startedAt).toISOString(),
      readyAt: toIso(readyAt),
      useByAt: toIso(useByAt),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-2 flex flex-col gap-3">
        {!item && (
          <div>
            <Text size="1" weight="medium" as="p" mb="1">
              Start from
            </Text>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_TEMPLATES.map(template => (
                <Button
                  key={template.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyTemplate(template)}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Name
          </Text>
          <Input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={NAME_PLACEHOLDER}
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Text size="1" weight="medium" as="p" mb="1">
              Stage
            </Text>
            <Select
              selectedOption={kind}
              setValue={value => setKind(value as KitchenProjectKind)}
              options={KIND_OPTIONS}
              displayMapper={KIND_LABELS}
              triggerClassName="w-full"
            />
          </div>
          <div className="flex-1">
            <Text size="1" weight="medium" as="p" mb="1">
              Where
            </Text>
            <Select
              selectedOption={location}
              setValue={value => setLocation(value as KitchenProjectLocation)}
              options={[...KITCHEN_PROJECT_LOCATIONS]}
              displayMapper={LOCATION_LABELS}
              triggerClassName="w-full"
            />
          </div>
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Started
          </Text>
          <input
            type="datetime-local"
            value={startedAt}
            onChange={e => setStartedAt(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Text size="1" weight="medium" as="p" mb="1">
              Ready at
            </Text>
            <input
              type="datetime-local"
              value={readyAt}
              onChange={e => setReadyAt(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="flex-1">
            <Text size="1" weight="medium" as="p" mb="1">
              Use by
            </Text>
            <input
              type="datetime-local"
              value={useByAt}
              onChange={e => setUseByAt(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            Notes
          </Text>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={NOTES_PLACEHOLDER}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {CANCEL_LABEL}
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {SAVE_LABEL}
          </Button>
        </div>
      </div>
    </form>
  );
}
