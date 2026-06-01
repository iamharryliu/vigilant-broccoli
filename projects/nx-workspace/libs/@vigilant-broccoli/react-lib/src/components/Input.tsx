import * as React from 'react';
import { cn } from '../utils/cn';
import { Search } from 'lucide-react';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
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
