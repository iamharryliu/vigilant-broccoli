import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getBreadcrumbAncestors } from '../consts/breadcrumbs';
import { isStatusHost, toProjectsUrl } from '../consts/hosts';

interface BreadcrumbProps {
  current: string;
  route?: string;
}

export function Breadcrumb({ current, route }: BreadcrumbProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const ancestors = getBreadcrumbAncestors(route ?? pathname);
  const onStatusHost = isStatusHost();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {ancestors.map(crumb => (
        <Fragment key={crumb.path}>
          {onStatusHost ? (
            <a href={toProjectsUrl(crumb.path)} className="hover:underline">
              {t(crumb.labelKey)}
            </a>
          ) : (
            <Link to={crumb.path} className="hover:underline">
              {t(crumb.labelKey)}
            </Link>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </Fragment>
      ))}
      <span aria-current="page" className="text-gray-700 dark:text-gray-300">
        {current}
      </span>
    </nav>
  );
}
