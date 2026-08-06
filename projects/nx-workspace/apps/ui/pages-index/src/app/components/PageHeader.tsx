import { ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-12">
      <Breadcrumb current={title} />
      <div className="mt-2 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </header>
  );
}
