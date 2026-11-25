import { Button, cn, Text } from '@vigilant-broccoli/react-lib';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

type KanbanLaneFrameProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> & {
  header?: ReactNode;
  footer?: ReactNode;
  isOver?: boolean;
};

export const KanbanLaneFrame = forwardRef<HTMLElement, KanbanLaneFrameProps>(
  ({ header, footer, isOver, className, children, ...rest }, ref) => (
    <section
      ref={ref}
      className={cn(
        'flex shrink-0 flex-col rounded-lg',
        isOver && 'ring-2 ring-blue-400',
        className,
      )}
      {...rest}
    >
      {header}
      {children}
      {footer}
    </section>
  ),
);
KanbanLaneFrame.displayName = 'KanbanLaneFrame';

const ADD_LANE_LABEL = '+ Add Lane';

// Forwards its ref and props so it can be a Dialog trigger via `asChild`.
export const KanbanAddLaneButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...rest }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      'h-auto min-h-12 w-80 flex-shrink-0 self-stretch border-2 border-dashed',
      className,
    )}
    {...rest}
  >
    {children ?? <Text size="3">{ADD_LANE_LABEL}</Text>}
  </Button>
));
KanbanAddLaneButton.displayName = 'KanbanAddLaneButton';
