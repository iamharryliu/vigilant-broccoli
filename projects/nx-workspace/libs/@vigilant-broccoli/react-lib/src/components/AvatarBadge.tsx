import React, { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type AvatarBadgeSize = 'small' | 'medium' | 'large';
export type AvatarBadgeVariant = 'primary' | 'secondary' | 'destructive';

const DEFAULT_SIZE: AvatarBadgeSize = 'medium';
const DEFAULT_VARIANT: AvatarBadgeVariant = 'primary';

interface AvatarBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: AvatarBadgeSize;
  variant?: AvatarBadgeVariant;
}

const SIZE_CLASSES: Record<AvatarBadgeSize, string> = {
  small: 'h-5 w-5 text-[8px]',
  medium: 'h-6 w-6 text-[12px]',
  large: 'h-8 w-8 text-[16px]',
};

const VARIANT_CLASSES: Record<AvatarBadgeVariant, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export function AvatarBadge({
  children,
  size = DEFAULT_SIZE,
  variant = DEFAULT_VARIANT,
  className,
  ...props
}: AvatarBadgeProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 rounded-full flex items-center justify-center border-2 border-background',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
