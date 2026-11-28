import { LogOut } from 'lucide-react';
import { ComponentProps } from 'react';
import { Button } from './Button';

const DEFAULT_LABEL = 'Sign out';
const ICON_SIZE = 16;

type SignOutLabelProps = {
  label?: string;
  iconSize?: number;
  labelClassName?: string;
};

// Icon plus label for sign-out hosts that are not a Button (menu items, sidebar rows); the host owns layout and spacing.
export const SignOutLabel = ({
  label = DEFAULT_LABEL,
  iconSize = ICON_SIZE,
  labelClassName,
}: SignOutLabelProps) => (
  <>
    <LogOut size={iconSize} className="shrink-0" />
    <span className={labelClassName}>{label}</span>
  </>
);

// Standard sign-out action: icon plus label; an async `onClick` shows Button's pending state.
export const SignOutButton = ({
  label,
  variant = 'outline',
  ...props
}: Omit<ComponentProps<typeof Button>, 'children'> & { label?: string }) => (
  <Button variant={variant} {...props}>
    <SignOutLabel label={label} />
  </Button>
);
