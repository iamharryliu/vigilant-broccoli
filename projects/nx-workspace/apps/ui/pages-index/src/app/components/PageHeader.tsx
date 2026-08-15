import { ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <Breadcrumb current={title} />
      {action && <div className="mt-2 flex justify-end">{action}</div>}
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </header>
  );
}
