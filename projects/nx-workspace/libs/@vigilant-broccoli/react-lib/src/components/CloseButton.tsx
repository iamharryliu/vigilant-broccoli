import { ComponentProps, forwardRef } from 'react';
import { IconButton } from './IconButton';

type CloseButtonProps = Omit<ComponentProps<typeof IconButton>, 'icon'>;

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ variant = 'ghost', ...props }, ref) => (
    <IconButton ref={ref} icon="x" variant={variant} {...props} />
  ),
);
CloseButton.displayName = 'CloseButton';
