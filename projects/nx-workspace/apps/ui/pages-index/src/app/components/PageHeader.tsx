import { Breadcrumb } from './Breadcrumb';
import { usePageTitle } from '../use-page-title';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  usePageTitle(title);

  return (
    <header className="mb-6">
      <Breadcrumb current={title} />
    </header>
  );
}
