import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <Breadcrumb current={title} />
    </header>
  );
}
