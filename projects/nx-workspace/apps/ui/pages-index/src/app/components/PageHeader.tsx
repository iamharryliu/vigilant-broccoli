import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="mb-12">
      <Link
        to="/"
        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
      >
        {t('COMMON.BACK')}
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </header>
  );
}
