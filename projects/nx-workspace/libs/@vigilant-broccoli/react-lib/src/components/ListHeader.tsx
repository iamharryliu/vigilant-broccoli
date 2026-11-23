import type { ReactNode } from 'react';

// Title on the left and a trailing control, such as a `SortSelect`, on the
// right of one row. Inside a `CardContainer` pass the control to its
// `headerAction` instead, which puts it beside the card title.
export const ListHeader = ({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex justify-between items-center gap-2">
    {title}
    {children}
  </div>
);
