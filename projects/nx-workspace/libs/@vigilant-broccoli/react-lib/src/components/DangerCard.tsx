import { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../utils/cn';

export interface DangerCardProps {
  title: ReactNode;
  description?: ReactNode;
  actionLabel: ReactNode;
  actionIcon?: ReactNode;
  onAction: () => void;
  actionDisabled?: boolean;
  className?: string;
}

// A destructive-action row: a red-outlined card with the heading and warning
// text on the left and a red outline button floating to the right. The action
// is expected to open a confirmation, not to destroy anything on its own.
export const DangerCard = ({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled,
  className,
}: DangerCardProps) => (
  <Card
    className={cn(
      'flex flex-wrap items-center justify-between gap-3 border-destructive/60 p-4',
      className,
    )}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <h2 className="m-0 text-sm font-semibold">{title}</h2>
      {description && (
        <p className="m-0 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <Button
      variant="outline"
      className="shrink-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={actionDisabled}
      onClick={onAction}
    >
      {actionIcon}
      {actionLabel}
    </Button>
  </Card>
);
