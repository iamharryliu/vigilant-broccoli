'use client';

import { cn } from '../utils/cn';
import { Checkbox } from './Checkbox';

export type CheckboxCardOption<T extends string> = {
  value: T;
  label: string;
};

export function CheckboxCardGroup<T extends string>({
  label,
  values,
  options,
  onChange,
  className,
}: {
  label: string;
  values: T[];
  options: CheckboxCardOption<T>[];
  onChange: (values: T[]) => void;
  className?: string;
}) {
  const toggle = (value: T, isChecked: boolean) =>
    onChange(
      // Option order keeps the emitted list stable regardless of click order.
      options
        .map(option => option.value)
        .filter(optionValue =>
          optionValue === value ? isChecked : values.includes(optionValue),
        ),
    );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map(option => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
        >
          <Checkbox
            checked={values.includes(option.value)}
            onCheckedChange={checked => toggle(option.value, checked === true)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
