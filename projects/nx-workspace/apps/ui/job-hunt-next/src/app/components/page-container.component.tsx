import type { ReactNode } from 'react';

type PageContainerProps = {
  title: string;
  // Right-aligned in the header, such as a page's call-to-action buttons.
  actions?: ReactNode;
  children: ReactNode;
};

export const PageContainer = ({
  title,
  actions,
  children,
}: PageContainerProps) => (
  <div className="flex min-h-0 flex-1 flex-col gap-3">
    <header className="flex items-center justify-between gap-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      {actions}
    </header>
    {children}
  </div>
);
