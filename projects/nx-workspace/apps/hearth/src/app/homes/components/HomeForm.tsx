'use client';

import { Button, Input, Text } from '@vigilant-broccoli/react-lib';

export type SaveStatus = 'idle' | 'saving' | 'saved';

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
};

type Props = {
  name: string;
  description: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  status?: SaveStatus;
  onSave?: () => void;
  saving?: boolean;
  disabled?: boolean;
};

export const HomeForm = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  status,
  onSave,
  saving = false,
  disabled = false,
}: Props) => (
  <div className="flex flex-col gap-3">
    <div>
      <div className="flex items-center justify-between mb-1">
        <Text size="1" weight="medium" as="p">
          Name
        </Text>
        {!disabled && status && (
          <Text
            size="1"
            color="gray"
            className={`transition-opacity duration-300 ${
              status === 'idle' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {STATUS_LABEL[status]}
          </Text>
        )}
      </div>
      <Input
        value={name}
        onChange={e => onNameChange(e.target.value)}
        placeholder="Home name"
        disabled={disabled}
      />
    </div>
    <div>
      <Text size="1" weight="medium" as="p" mb="1">
        Description
      </Text>
      <Input
        value={description}
        onChange={e => onDescriptionChange(e.target.value)}
        placeholder="Description"
        disabled={disabled}
      />
    </div>
    {onSave && (
      <Button
        onClick={onSave}
        disabled={saving || !name.trim()}
        className="cursor-pointer"
      >
        Save
      </Button>
    )}
  </div>
);
