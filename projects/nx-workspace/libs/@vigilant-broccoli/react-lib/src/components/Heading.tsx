import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export const headingVariants = cva('font-bold tracking-tight', {
  variants: {
    size: {
      '1': 'text-xs',
      '2': 'text-sm',
      '3': 'text-base',
      '4': 'text-lg',
      '5': 'text-xl',
      '6': 'text-2xl',
      '7': 'text-[1.75rem]',
      '8': 'text-[2.1875rem]',
      '9': 'text-[3.75rem]',
    },
    weight: {
      light: 'font-light',
      regular: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    color: {
      gray: 'text-gray-500 dark:text-gray-400',
      red: 'text-red-600 dark:text-red-400',
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      orange: 'text-orange-600 dark:text-orange-400',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    mb: {
      '1': 'mb-1',
      '2': 'mb-2',
      '3': 'mb-3',
      '4': 'mb-4',
      '5': 'mb-6',
      '6': 'mb-8',
      '7': 'mb-10',
      '8': 'mb-12',
      '9': 'mb-16',
    },
  },
});

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingProps = VariantProps<typeof headingVariants> &
  Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> & {
    as?: HeadingElement;
    asChild?: boolean;
  };

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { as = 'h1', asChild, size, weight, color, align, mb, className, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : (as as React.ElementType);
    return (
      <Comp
        ref={ref}
        className={cn(
          headingVariants({ size, weight, color, align, mb }),
          className,
        )}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';
