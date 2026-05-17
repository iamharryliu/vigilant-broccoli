import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import React, { ButtonHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        xs: 'h-6 rounded-md px-2 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      onClick,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const [asyncLoading, setAsyncLoading] = useState(false);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = e => {
      if (!onClick) return;
      const result = (
        onClick as (
          e: React.MouseEvent<HTMLButtonElement>,
        ) => Promise<void> | void
      )(e);
      if (result instanceof Promise) {
        setAsyncLoading(true);
        result.finally(() => setAsyncLoading(false));
      }
    };

    const isLoading = loading !== undefined ? loading : asyncLoading;

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={isLoading || disabled}
        className={cn(buttonVariants({ variant, size }), 'relative', className)}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
            <span className="invisible inline-flex items-center gap-2">
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';
