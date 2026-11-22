'use client';

import { Select } from './Select';
import { Text } from './Text';

const DEFAULT_LABEL = 'Sort:';
const DEFAULT_PLACEHOLDER = 'Sort by...';

export const SortSelect = <T extends string>({
  value,
  onValueChange,
  options,
  labels,
  label = DEFAULT_LABEL,
  placeholder = DEFAULT_PLACEHOLDER,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: T[];
  labels: Record<T, string>;
  label?: string;
  placeholder?: string;
}) => (
  <div className="flex gap-2 items-center">
    <Text size="2" color="gray">
      {label}
    </Text>
    <Select
      value={value}
      onValueChange={onValueChange}
      options={options}
      displayMapper={labels}
      placeholder={placeholder}
    />
  </div>
);
