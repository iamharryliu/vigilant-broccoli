/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { CheckedState } from '@radix-ui/react-checkbox';
import { ChevronDown } from 'lucide-react';
import React, { ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { cn } from '../utils/cn';
import { Checkbox } from './Checkbox';
import { Popover } from './Popover';

const MULTISELECT_TEXT = {
  SELECT: 'Select',
  NO_OPTIONS: 'No options',
} as const;

interface MultiSelectProps<T extends Record<string, any>> {
  values?: string[];
  options: T[];
  onValueChange(value: string[]): void;
  displayKey: string;
  renderOption?: (option: T) => ReactNode;
  placeholder?: string;
  showSelection?: boolean;
  triggerClassName?: string;
}

export function MultiSelect<T extends Record<string, any>>({
  values: value,
  options,
  onValueChange,
  displayKey,
  renderOption,
  placeholder,
  showSelection = false,
  triggerClassName,
}: MultiSelectProps<T>) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const idPrefix = useId();

  useEffect(() => {
    setSelectedOptionIds(value?.map(String) ?? []);
  }, [value]);

  const handleTypeToggle = (typeId: string, checked: CheckedState) => {
    const newSelection = checked
      ? [...selectedOptionIds, typeId]
      : selectedOptionIds.filter(id => id !== typeId);
    setSelectedOptionIds(newSelection);
    onValueChange(newSelection);
  };

  const displayText = useMemo(() => {
    const defaultText = placeholder ?? MULTISELECT_TEXT.SELECT;
    if (!showSelection || selectedOptionIds.length === 0) return defaultText;
    const selectedTypes = options.filter(option =>
      selectedOptionIds.includes(option.id.toString()),
    );
    return selectedTypes.map(option => option[displayKey]).join(', ');
  }, [selectedOptionIds, options, displayKey, placeholder, showSelection]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <button
          type="button"
          className={cn(
            'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName,
          )}
        >
          <span
            className={cn(
              'text-sm overflow-hidden overflow-ellipsis whitespace-nowrap',
              showSelection && selectedOptionIds.length > 0
                ? 'text-foreground'
                : 'text-muted-foreground',
            )}
          >
            {displayText}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="w-max min-w-[var(--radix-popover-trigger-width)] p-1"
      >
        {options.map(option => {
          const optionId = `${idPrefix}-${option.id}`;
          return (
            <div
              key={option.id}
              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
            >
              <Checkbox
                id={optionId}
                checked={selectedOptionIds.includes(option.id.toString())}
                onCheckedChange={checked =>
                  handleTypeToggle(option.id.toString(), checked)
                }
              />
              <label
                htmlFor={optionId}
                className="text-sm cursor-pointer flex-grow text-foreground"
              >
                {renderOption ? renderOption(option) : option[displayKey]}
              </label>
            </div>
          );
        })}
        {options.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground">
            {MULTISELECT_TEXT.NO_OPTIONS}
          </div>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}
