import { ComponentProps } from 'react';
import { IconButton } from './IconButton';
import { cn } from '../utils/cn';

type DeleteIconButtonProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'variant'
>;

export const DeleteIconButton = ({
  className,
  ...props
}: DeleteIconButtonProps) => (
  <IconButton
    icon="trash"
    variant="ghost"
    className={cn('hover:text-destructive hover:bg-destructive/10', className)}
    {...props}
  />
);
