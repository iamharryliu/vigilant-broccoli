import { ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Select = <T extends number | string | Record<string, any>>({
  selectedOption,
  setValue,
  options,
  placeholder = 'Select',
  optionDisplayKey,
  optionIdenfifier = 'id',
  displayMapper,
  disabled = false,
  triggerClassName,
  renderItem,
}: {
  selectedOption?: T;
  setValue?: (value: T) => void;
  options: T[];
  placeholder?: string;
  optionDisplayKey?: string;
  optionIdenfifier?: string;
  displayMapper?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  triggerClassName?: string;
  renderItem?: (option: T) => ReactNode;
}) => {
  const getOptionValue = (option: T): string => {
    if (typeof option === 'number') {
      return String(option);
    }
    if (typeof option === 'string') {
      return option;
    }
    return optionIdenfifier ? String(option[optionIdenfifier]) : String(option);
  };

  const getOptionDisplay = (option: T): string => {
    if (typeof option === 'number') {
      return String(option);
    }
    if (typeof option === 'string') {
      return displayMapper ? displayMapper[option] : option;
    }
    return optionDisplayKey ? String(option[optionDisplayKey]) : String(option);
  };

  return (
    <SelectPrimitive.Root
      value={selectedOption ? getOptionValue(selectedOption) : undefined}
      disabled={disabled}
      onValueChange={val => {
        const selected = options.find(option => getOptionValue(option) === val);
        if (selected && setValue) {
          setValue(selected);
        }
      }}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'inline-flex h-10 w-fit items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          triggerClassName,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          className="relative z-50 max-h-96 min-w-[8rem] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-background text-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1"
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
