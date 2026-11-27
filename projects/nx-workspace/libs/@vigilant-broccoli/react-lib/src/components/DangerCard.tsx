import { ReactNode } from 'react';
import { Button } from './Button';
import { Text } from './Text';
import { cn } from '../utils/cn';

export interface DangerCardProps {
  title: ReactNode;
  description?: ReactNode;
  actionLabel: ReactNode;
  actionIcon?: ReactNode;
  onAction: () => void;
  actionDisabled?: boolean;
  className?: string;
  // Rendered inside the card, e.g. the confirmation dialog the action opens.
  children?: ReactNode;
}

// A destructive-action row: a red-outlined card with the heading and warning
// text on the left and a filled destructive button on the right. The action
// is expected to open a confirmation, not to destroy anything on its own.
export const DangerCard = ({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled,
  className,
  children,
}: DangerCardProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-4 rounded-lg border border-red-300 px-4 py-3 dark:border-red-900',
      className,
    )}
  >
    <div className="min-w-0">
      <Text size="2" weight="medium" as="p">
        {title}
      </Text>
      {description && (
        <Text size="1" color="gray">
          {description}
        </Text>
      )}
    </div>
    <Button
      variant="destructive"
      className="shrink-0"
      disabled={actionDisabled}
      onClick={onAction}
    >
      {actionIcon}
      {actionLabel}
    </Button>
    {children}
  </div>
);
