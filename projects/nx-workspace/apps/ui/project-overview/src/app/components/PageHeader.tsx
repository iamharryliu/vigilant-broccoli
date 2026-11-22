import { Breadcrumb } from './Breadcrumb';
import { SearchButton } from './SearchButton';
import { usePageTitle } from '../use-page-title';

interface PageHeaderProps {
  title: string;
  route?: string;
}

export function PageHeader({ title, route }: PageHeaderProps) {
  usePageTitle(title);

  return (
    <header className="mb-6 flex items-center justify-between gap-2">
      <Breadcrumb current={title} route={route} />
      <SearchButton />
    </header>
  );
}
