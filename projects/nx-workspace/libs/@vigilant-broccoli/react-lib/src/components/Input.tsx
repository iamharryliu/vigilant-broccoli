import * as React from 'react';
import { cn } from '../utils/cn';
import { Search, X } from 'lucide-react';

const CLEAR_INPUT_LABEL = 'Clear search';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const InputGroup = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn('relative flex items-center', className)}>{children}</div>
);

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    hasStartAddon?: boolean;
    hasEndAddon?: boolean;
  }
>(({ className, hasStartAddon, hasEndAddon, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      'w-full',
      hasStartAddon && 'pl-8',
      hasEndAddon && 'pr-8',
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = 'InputGroupInput';

export const InputGroupAddon = ({
  align = 'inline-start',
  children,
  className,
}: {
  align?: 'inline-start' | 'inline-end';
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'pointer-events-none absolute flex items-center text-muted-foreground',
      align === 'inline-start' ? 'left-2.5' : 'right-2.5',
      className,
    )}
  >
    {children}
  </div>
);

export const InputGroupText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <span className={cn('text-sm', className)}>{children}</span>;

export const ClearableInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    onClear: () => void;
    startAddon?: React.ReactNode;
    clearLabel?: string;
  }
>(
  (
    {
      onClear,
      startAddon,
      clearLabel = CLEAR_INPUT_LABEL,
      value,
      className,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const hasValue = String(value ?? '').length > 0;

    return (
      <InputGroup>
        {startAddon && (
          <InputGroupAddon align="inline-start">{startAddon}</InputGroupAddon>
        )}
        <InputGroupInput
          ref={inputRef}
          value={value}
          hasStartAddon={Boolean(startAddon)}
          hasEndAddon
          className={className}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            aria-label={clearLabel}
            title={clearLabel}
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </InputGroup>
    );
  },
);
ClearableInput.displayName = 'ClearableInput';

export const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <InputGroup>
    <InputGroupAddon align="inline-start">
      <Search size={14} />
    </InputGroupAddon>
    <InputGroupInput
      ref={ref}
      hasStartAddon
      className={cn('h-7 text-xs', className)}
      {...props}
    />
  </InputGroup>
));
SearchInput.displayName = 'SearchInput';
