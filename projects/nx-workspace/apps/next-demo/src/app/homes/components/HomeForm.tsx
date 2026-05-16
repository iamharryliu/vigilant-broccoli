'use client';

import { Flex, Text, TextField } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';

type Props = {
  name: string;
  description: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  disabled?: boolean;
};

export const HomeForm = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSave,
  saving,
  disabled = false,
}: Props) => (
  <Flex direction="column" gap="3">
    <div>
      <Text size="1" weight="medium" as="p" mb="1">
        Name
      </Text>
      <TextField.Root
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
      <TextField.Root
        value={description}
        onChange={e => onDescriptionChange(e.target.value)}
        placeholder="Description"
        disabled={disabled}
      />
    </div>
    {!disabled && (
      <Button
        onClick={onSave}
        disabled={saving || !name.trim()}
        className="cursor-pointer"
      >
        Save
      </Button>
    )}
  </Flex>
);
