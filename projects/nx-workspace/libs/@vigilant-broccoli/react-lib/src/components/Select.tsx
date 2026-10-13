'use client';

import { ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { usePortalTheme } from '../hooks/usePortalTheme';

const DEFAULT_PLACEHOLDER = 'Select';
const DEFAULT_OPTION_IDENTIFIER = 'id';

type SelectOption = number | string | object;

export type SelectProps<T extends SelectOption> = {
  value?: T;
  onValueChange?: (value: T) => void;
  /** @deprecated Use value. */
  selectedOption?: T;
  /** @deprecated Use onValueChange. */
  setValue?: (value: T) => void;
  options: T[];
  placeholder?: string;
  optionDisplayKey?: string;
  optionIdentifier?: string;
  /** @deprecated Use optionIdentifier. */
  optionIdenfifier?: string;
  displayMapper?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  triggerClassName?: string;
  renderItem?: (option: T) => ReactNode;
  id?: string;
  'aria-label'?: string;
};

export const Select = <T extends SelectOption>(props: SelectProps<T>) => {
  const {
    value,
    onValueChange,
    selectedOption,
    setValue,
    options,
    placeholder = DEFAULT_PLACEHOLDER,
    optionDisplayKey,
    optionIdentifier,
    optionIdenfifier,
    displayMapper,
    className,
    disabled = false,
    triggerClassName,
    renderItem,
    id,
    'aria-label': ariaLabel,
  } = props;
  const theme = usePortalTheme();
  const isControlled = 'value' in props || 'selectedOption' in props;
  const selection = 'value' in props ? value : selectedOption;
  const handleValueChange = onValueChange ?? setValue;
  const identifier =
    optionIdentifier ?? optionIdenfifier ?? DEFAULT_OPTION_IDENTIFIER;
  const getOptionValue = (option: T): string => {
    if (typeof option === 'number') {
      return String(option);
    }
    if (typeof option === 'string') {
      return option;
    }
    return identifier
      ? String((option as Record<string, unknown>)[identifier])
      : String(option);
  };

  const getOptionDisplay = (option: T): string => {
    if (typeof option === 'number') {
      return String(option);
    }
    if (typeof option === 'string') {
      return displayMapper?.[option] ?? option;
    }
    return optionDisplayKey
      ? String((option as Record<string, unknown>)[optionDisplayKey])
      : String(option);
  };

  return (
    <SelectPrimitive.Root
      value={
        selection !== undefined
          ? getOptionValue(selection)
          : isControlled
            ? ''
            : undefined
      }
      disabled={disabled}
      onValueChange={val => {
        const selected = options.find(option => getOptionValue(option) === val);
        if (selected !== undefined) {
          handleValueChange?.(selected);
        }
      }}
    >
      <span hidden ref={theme.anchorRef} />
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-10 w-fit items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className,
          triggerClassName,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
            theme.className,
          )}
          style={theme.style}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map(option => (
              <SelectPrimitive.Item
                key={getOptionValue(option)}
                value={getOptionValue(option)}
                className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemText>
                  {renderItem ? renderItem(option) : getOptionDisplay(option)}
                </SelectPrimitive.ItemText>
                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
