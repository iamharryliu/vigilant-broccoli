'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { cn } from '@vigilant-broccoli/react-lib';
import { APP_ROUTE } from '../app.const';
import { useTranslation } from '../i18n';

export const AppNav = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 p-4">
        <span className="flex items-center gap-2 font-semibold">
          <Briefcase size={16} /> {t('APP.LABEL')}
        </span>
        {Object.values(APP_ROUTE).map(route => (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              'text-sm text-muted-foreground hover:text-foreground',
              pathname === route.path && 'font-medium text-foreground',
            )}
          >
            {t(route.titleKey)}
          </Link>
        ))}
      </nav>
    </header>
  );
};
