import { Breadcrumb } from './Breadcrumb';
import { usePageTitle } from '../use-page-title';

interface PageHeaderProps {
  title: string;
  route?: string;
}

export function PageHeader({ title, route }: PageHeaderProps) {
  usePageTitle(title);

  return (
    <header className="mb-6">
      <Breadcrumb current={title} route={route} />
    </header>
  );
}
