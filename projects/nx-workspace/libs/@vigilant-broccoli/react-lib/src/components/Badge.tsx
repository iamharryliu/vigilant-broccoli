import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export const badgeVariants = cva(
  'inline-flex w-fit items-center gap-1 rounded-md font-medium whitespace-nowrap',
  {
    variants: {
      size: {
        '1': 'px-1.5 py-0.5 text-xs',
        '2': 'px-2 py-1 text-sm',
      },
      color: {
        gray: '',
        red: '',
        blue: '',
        green: '',
        orange: '',
        amber: '',
        purple: '',
        yellow: '',
      },
      variant: {
        soft: '',
        solid: '',
        outline: '',
        surface: '',
      },
    },
    compoundVariants: [
      {
        color: 'gray',
        variant: 'soft',
        class: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      },
      {
        color: 'gray',
        variant: 'solid',
        class: 'bg-gray-600 text-white dark:bg-gray-500',
      },
      {
        color: 'gray',
        variant: 'outline',
        class:
          'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      },
      {
        color: 'gray',
        variant: 'surface',
        class:
          'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
      },
      {
        color: 'red',
        variant: 'soft',
        class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      },
      {
        color: 'red',
        variant: 'solid',
        class: 'bg-red-600 text-white dark:bg-red-500',
      },
      {
        color: 'red',
        variant: 'outline',
        class:
          'border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',
      },
      {
        color: 'red',
        variant: 'surface',
        class:
          'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
      },
      {
        color: 'blue',
        variant: 'soft',
        class:
          'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      },
      {
        color: 'blue',
        variant: 'solid',
        class: 'bg-blue-600 text-white dark:bg-blue-500',
      },
      {
        color: 'blue',
        variant: 'outline',
        class:
          'border border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300',
      },
      {
        color: 'blue',
        variant: 'surface',
        class:
          'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
      },
      {
        color: 'green',
        variant: 'soft',
        class:
          'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      },
      {
        color: 'green',
        variant: 'solid',
        class: 'bg-green-600 text-white dark:bg-green-500',
      },
      {
        color: 'green',
        variant: 'outline',
        class:
          'border border-green-300 text-green-700 dark:border-green-700 dark:text-green-300',
      },
      {
        color: 'green',
        variant: 'surface',
        class:
          'border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300',
      },
      {
        color: 'orange',
        variant: 'soft',
        class:
          'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      },
      {
        color: 'orange',
        variant: 'solid',
        class: 'bg-orange-600 text-white dark:bg-orange-500',
      },
      {
        color: 'orange',
        variant: 'outline',
        class:
          'border border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300',
      },
      {
        color: 'orange',
        variant: 'surface',
        class:
          'border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
      },
      {
        color: 'amber',
        variant: 'soft',
        class:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      },
      {
        color: 'amber',
        variant: 'solid',
        class: 'bg-amber-600 text-white dark:bg-amber-500',
      },
      {
        color: 'amber',
        variant: 'outline',
        class:
          'border border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300',
      },
      {
        color: 'amber',
        variant: 'surface',
        class:
          'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      },
      {
        color: 'purple',
        variant: 'soft',
        class:
          'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      },
      {
        color: 'purple',
        variant: 'solid',
        class: 'bg-purple-600 text-white dark:bg-purple-500',
      },
      {
        color: 'purple',
        variant: 'outline',
        class:
          'border border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300',
      },
      {
        color: 'purple',
        variant: 'surface',
        class:
          'border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
      },
      {
        color: 'yellow',
        variant: 'soft',
        class:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      },
      {
        color: 'yellow',
        variant: 'solid',
        class: 'bg-yellow-500 text-white dark:bg-yellow-500',
      },
      {
        color: 'yellow',
        variant: 'outline',
        class:
          'border border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300',
      },
      {
        color: 'yellow',
        variant: 'surface',
        class:
          'border border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
      },
    ],
    defaultVariants: {
      size: '1',
      color: 'gray',
      variant: 'soft',
    },
  },
);

export type BadgeProps = VariantProps<typeof badgeVariants> &
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> & {
    asChild?: boolean;
  };

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ asChild, size, color, variant, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ size, color, variant }), className)}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';
