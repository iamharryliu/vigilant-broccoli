import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';
import { cn } from '../utils/cn';

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
