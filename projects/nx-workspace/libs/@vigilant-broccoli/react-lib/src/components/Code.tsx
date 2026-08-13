import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export const codeVariants = cva(
  'rounded bg-gray-100 dark:bg-gray-800 font-mono text-gray-800 dark:text-gray-200',
  {
    variants: {
      size: {
        '1': 'text-xs px-1 py-0.5',
        '2': 'text-sm px-1.5 py-0.5',
        '3': 'text-base px-1.5 py-1',
      },
    },
    defaultVariants: {
      size: '1',
    },
  },
);

export type CodeProps = VariantProps<typeof codeVariants> &
  Omit<React.HTMLAttributes<HTMLElement>, 'color'> & {
    asChild?: boolean;
  };

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ asChild, size, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'code';
    return (
      <Comp
        ref={ref}
        className={cn(codeVariants({ size }), className)}
        {...props}
      />
    );
  },
);
Code.displayName = 'Code';
