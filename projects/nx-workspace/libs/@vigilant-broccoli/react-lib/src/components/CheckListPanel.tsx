import { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface CheckListPanelProps {
  /** Controls kept in view above the list, such as progress or an add row. */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Pins `header` and scrolls only `children`. The panel must sit in a
 * height-bound parent (`h-full`, or `flex-1 min-h-0` in a flex column; a
 * `CardContainer` needs `fill`), or the list grows instead of scrolling.
 */
export const CheckListPanel = ({
  header,
  children,
  className,
  bodyClassName,
}: CheckListPanelProps) => (
  <div className={cn('flex flex-col', className)}>
    {header}
    <div className={cn('min-h-0 flex-1 overflow-y-auto', bodyClassName)}>
      {children}
    </div>
  </div>
);
