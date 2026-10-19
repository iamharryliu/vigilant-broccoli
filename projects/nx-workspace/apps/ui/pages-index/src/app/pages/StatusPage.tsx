import { Activity } from 'lucide-react';
import {
  UpptimeServiceGroup,
  UpptimeStatusList,
  UpptimeStatusListLabels,
  useUpptimeSummary,
} from '@vigilant-broccoli/react-lib';
import { GithubActionsBadges } from '@vigilant-broccoli/react-lib-media';
import { useTranslation } from '../i18n';
import { CardGrid } from '../components/CardGrid';
import { CardLink } from '../components/CardLink';
import { PageHeader } from '../components/PageHeader';
import {
  REPO_URL,
  UPTIME_REPO_URL,
  UPTIME_SITE_URL,
  UPTIME_SUMMARY_URL,
} from '../consts/repo';
import { PAGE_CLASS } from '../consts/layout';
import { STATUS_ROUTE } from '../consts/routes';

const ACTIONS_URL = `${REPO_URL}/actions`;

const PRODUCTION_PREFIX = 'production-';
const STAGING_PREFIX = 'staging-';
const DEMO_PREFIX = 'demo-';

interface StatusPageProps {
  wrapped?: boolean;
}

export function StatusPage({ wrapped = true }: StatusPageProps) {
  const { t } = useTranslation();
  const summary = useUpptimeSummary(UPTIME_SUMMARY_URL);

  const groups: UpptimeServiceGroup[] = [
    {
      id: 'production',
      label: t('STATUS_PAGE.GROUP_PRODUCTION'),
      match: svc => svc.name.startsWith(PRODUCTION_PREFIX),
      showLegend: true,
    },
    {
      id: 'staging',
      label: t('STATUS_PAGE.GROUP_STAGING'),
      match: svc => svc.name.startsWith(STAGING_PREFIX),
      showLegend: true,
    },
    {
      id: 'demo',
      label: t('STATUS_PAGE.GROUP_DEMO'),
      match: svc => svc.name.startsWith(DEMO_PREFIX),
    },
    { id: 'personal', label: t('STATUS_PAGE.GROUP_PERSONAL') },
  ];

  const labels: Partial<UpptimeStatusListLabels> = {
    loading: t('STATUS_PAGE.LOADING_SERVICES'),
    empty: t('STATUS_PAGE.NO_SERVICES'),
    legendTitle: t('STATUS_PAGE.LEGEND_TITLE'),
    legendButton: t('STATUS_PAGE.LEGEND_BUTTON_LABEL'),
    rangeDay: t('STATUS_PAGE.UPTIME_RANGE_DAY'),
    rangeWeek: t('STATUS_PAGE.UPTIME_RANGE_WEEK'),
    rangeMonth: t('STATUS_PAGE.UPTIME_RANGE_MONTH'),
    rangeYear: t('STATUS_PAGE.UPTIME_RANGE_YEAR'),
    downtimeBar: (date, minutes) =>
      t('STATUS_PAGE.UPTIME_BAR_LABEL', { date, minutes }),
    errorStatus: status =>
      t('STATUS_PAGE.ERROR_STATUS_UNAVAILABLE', { status }),
    errorFailed: message => t('STATUS_PAGE.ERROR_STATUS_FAILED', { message }),
  };

  return (
    <main className={PAGE_CLASS}>
      <header className="mb-4">
        <PageHeader title={t('STATUS_PAGE.TITLE')} route={STATUS_ROUTE} />
        {summary.lastModified && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('STATUS_PAGE.UPDATED', {
              date: summary.lastModified.toLocaleString(),
            })}
          </p>
        )}
      </header>
      <CardGrid>
        <li className="mb-4">
          <CardLink
            href={UPTIME_SITE_URL}
            title={t('STATUS_PAGE.OPEN_UPTIME_IN_NEW_TAB')}
            description={t('STATUS_PAGE.OPEN_UPTIME_DESCRIPTION')}
            icon={<Activity className="h-5 w-5 shrink-0" aria-hidden="true" />}
          />
        </li>
      </CardGrid>
      <UpptimeStatusList summary={summary} groups={groups} labels={labels} />

      <section className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('STATUS_PAGE.GITHUB_ACTIONS')}
          </h2>
          <a
            href={ACTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:underline"
          >
            {t('STATUS_PAGE.VIEW_ALL')}
          </a>
        </div>
        <div
          className={
            wrapped
              ? 'flex flex-wrap gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3'
              : 'flex flex-wrap gap-1.5'
          }
        >
          <GithubActionsBadges repoUrl={REPO_URL} />
          <GithubActionsBadges repoUrl={UPTIME_REPO_URL} />
        </div>
      </section>
    </main>
  );
}
