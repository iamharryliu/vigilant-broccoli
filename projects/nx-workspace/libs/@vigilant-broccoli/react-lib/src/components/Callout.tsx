import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

export const calloutVariants = cva(
  'flex items-start gap-2 rounded-md border p-3 text-sm',
  {
    variants: {
      color: {
        gray: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300',
        red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
        blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
        green:
          'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
        orange:
          'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
      },
    },
    defaultVariants: {
      color: 'gray',
    },
  },
);

export type CalloutProps = VariantProps<typeof calloutVariants> &
  HTMLAttributes<HTMLDivElement>;

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ color, className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(calloutVariants({ color }), className)}
      {...props}
    />
  ),
);
Callout.displayName = 'Callout';

export const CalloutIcon = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('shrink-0', className)} {...props} />
);
CalloutIcon.displayName = 'CalloutIcon';

export const CalloutText = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('leading-normal', className)} {...props} />
);
CalloutText.displayName = 'CalloutText';
