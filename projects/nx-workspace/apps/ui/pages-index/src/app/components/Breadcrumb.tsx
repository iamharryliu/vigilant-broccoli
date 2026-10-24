import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getBreadcrumbAncestors } from '../consts/breadcrumbs';
import {
  isCareerHost,
  isDeploymentsHost,
  isStatusHost,
  toProjectsUrl,
} from '../consts/hosts';

interface BreadcrumbProps {
  current: string;
  route?: string;
}

export function Breadcrumb({ current, route }: BreadcrumbProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const ancestors = getBreadcrumbAncestors(route ?? pathname);
  // Both hosts serve a single page, so ancestors live on the projects host.
  const onProjectsLinkHost = isStatusHost() || isDeploymentsHost();
  const onCareerHost = isCareerHost();
  // The career host root is the career page, not the projects Home.
  const crumbLabel = (crumb: (typeof ancestors)[number]) =>
    onCareerHost && crumb.path === '/'
      ? t('CAREER_PAGE.TITLE')
      : t(crumb.labelKey);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {ancestors.map(crumb => (
        <Fragment key={crumb.path}>
          {onProjectsLinkHost ? (
            <a href={toProjectsUrl(crumb.path)} className="hover:underline">
              {crumbLabel(crumb)}
            </a>
          ) : (
            <Link to={crumb.path} className="hover:underline">
              {crumbLabel(crumb)}
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
