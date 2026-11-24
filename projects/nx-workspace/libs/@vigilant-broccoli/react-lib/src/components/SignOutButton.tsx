import { LogOut } from 'lucide-react';
import { ComponentProps } from 'react';
import { Button } from './Button';

const DEFAULT_LABEL = 'Sign Out';
const ICON_SIZE = 16;

// Standard sign-out action: icon plus label; an async `onClick` shows Button's pending state.
export const SignOutButton = ({
  label = DEFAULT_LABEL,
  variant = 'outline',
  ...props
}: Omit<ComponentProps<typeof Button>, 'children'> & { label?: string }) => (
  <Button variant={variant} {...props}>
    <LogOut size={ICON_SIZE} />
    {label}
  </Button>
);
