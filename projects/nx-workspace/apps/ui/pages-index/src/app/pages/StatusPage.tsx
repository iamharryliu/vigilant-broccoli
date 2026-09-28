import { useEffect, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DotPaths,
  GithubActionsBadges,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import en from '../i18n/en.json';
import { PageHeader } from '../components/PageHeader';
import { SectionHeading } from '../components/SectionHeading';
import { REPO_URL, toRawGithubUrl } from '../consts/repo';
import { PAGE_CLASS } from '../consts/layout';

const SUMMARY_URL = toRawGithubUrl('history/summary.json');
const ACTIONS_URL = `${REPO_URL}/actions`;

interface ServiceStatus {
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded' | 'unknown';
  uptime?: string;
  time?: number;
}

const STATUS_COLORS: Record<
  ServiceStatus['status'],
  { dot: string; label: string; description: string }
> = {
  up: {
    dot: 'bg-emerald-500',
    label: 'Up',
    description: 'Responding normally.',
  },
  down: {
    dot: 'bg-red-500',
    label: 'Down',
    description: 'Not responding to health checks.',
  },
  degraded: {
    dot: 'bg-amber-500',
    label: 'Degraded',
    description: 'Responding, but slower or with errors.',
  },
  unknown: {
    dot: 'bg-gray-400',
    label: 'Unknown',
    description: 'No recent check result.',
  },
};

const STATUS_GROUP = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  PERSONAL: 'personal',
} as const;
type StatusGroup = (typeof STATUS_GROUP)[keyof typeof STATUS_GROUP];

const PRODUCTION_PREFIX = 'production-';
const STAGING_PREFIX = 'staging-';

const STATUS_GROUP_ORDER: StatusGroup[] = [
  STATUS_GROUP.PRODUCTION,
  STATUS_GROUP.STAGING,
  STATUS_GROUP.PERSONAL,
];

const STATUS_GROUP_LABEL_KEY: Record<StatusGroup, DotPaths<typeof en>> = {
  [STATUS_GROUP.PRODUCTION]: 'STATUS_PAGE.GROUP_PRODUCTION',
  [STATUS_GROUP.STAGING]: 'STATUS_PAGE.GROUP_STAGING',
  [STATUS_GROUP.PERSONAL]: 'STATUS_PAGE.GROUP_PERSONAL',
};

const LEGEND_GROUPS: StatusGroup[] = [
  STATUS_GROUP.PRODUCTION,
  STATUS_GROUP.STAGING,
];

const LEGEND_STATUS_ORDER: ServiceStatus['status'][] = [
  'up',
  'degraded',
  'down',
  'unknown',
];

const getStatusGroup = (name: string): StatusGroup => {
  if (name.startsWith(PRODUCTION_PREFIX)) return STATUS_GROUP.PRODUCTION;
  if (name.startsWith(STAGING_PREFIX)) return STATUS_GROUP.STAGING;
  return STATUS_GROUP.PERSONAL;
};

const getDisplayText = (svc: ServiceStatus): string => {
  try {
    const { host, pathname } = new URL(svc.url);
    return pathname === '/' ? host : `${host}${pathname}`;
  } catch {
    return svc.name;
  }
};

const groupServices = (
  services: ServiceStatus[],
): Record<StatusGroup, ServiceStatus[]> => {
  const groups: Record<StatusGroup, ServiceStatus[]> = {
    [STATUS_GROUP.PRODUCTION]: [],
    [STATUS_GROUP.STAGING]: [],
    [STATUS_GROUP.PERSONAL]: [],
  };
  services.forEach(svc => groups[getStatusGroup(svc.name)].push(svc));
  STATUS_GROUP_ORDER.forEach(group =>
    groups[group].sort((a, b) =>
      getDisplayText(a).localeCompare(getDisplayText(b)),
    ),
  );
  return groups;
};

function ServiceListItem({ svc }: { svc: ServiceStatus }) {
  const status = STATUS_COLORS[svc.status] ?? STATUS_COLORS.unknown;
  return (
    <li>
      <a
        href={svc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
      >
        <span
          className={`h-2 w-2 rounded-full ${status.dot} shrink-0`}
          title={status.label}
        />
        <span className="flex-1 font-medium truncate">
          {getDisplayText(svc)}
        </span>
        <span className="shrink-0 font-mono text-gray-400 w-14 text-right">
          {svc.uptime || '—'}
        </span>
        <span className="shrink-0 font-mono text-gray-400 w-12 text-right">
          {typeof svc.time === 'number' ? `${svc.time}ms` : '—'}
        </span>
      </a>
    </li>
  );
}

function StatusLegendDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('STATUS_PAGE.LEGEND_TITLE')}</DialogTitle>
        </DialogHeader>
        <ul className="space-y-3 text-sm">
          {LEGEND_STATUS_ORDER.map(statusKey => (
            <li key={statusKey} className="flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${STATUS_COLORS[statusKey].dot} shrink-0`}
              />
              <span>
                <span className="font-medium">
                  {STATUS_COLORS[statusKey].label}
                </span>
                <span className="block text-gray-500 dark:text-gray-400">
                  {STATUS_COLORS[statusKey].description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

interface StatusPageProps {
  wrapped?: boolean;
}

export function StatusPage({ wrapped = true }: StatusPageProps) {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceStatus[] | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const grouped = services ? groupServices(services) : null;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${SUMMARY_URL}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          setServicesError(
            t('STATUS_PAGE.ERROR_STATUS_UNAVAILABLE', { status: res.status }),
          );
          return;
        }
        const lastModified = res.headers.get('last-modified');
        if (lastModified) {
          const d = new Date(lastModified);
          if (!Number.isNaN(d.getTime())) {
            setUpdated(t('STATUS_PAGE.UPDATED', { date: d.toLocaleString() }));
          }
        }
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        setServicesError(
          t('STATUS_PAGE.ERROR_STATUS_FAILED', {
            message: err instanceof Error ? err.message : String(err),
          }),
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={PAGE_CLASS}>
      <header className="mb-4">
        <PageHeader title={t('STATUS_PAGE.TITLE')} />
        {updated && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{updated}</p>
        )}
      </header>
      <StatusLegendDialog open={legendOpen} onOpenChange={setLegendOpen} />

      {servicesError && (
        <ul className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
          <li className="px-4 py-2 text-red-500">{servicesError}</li>
        </ul>
      )}
      {!servicesError && services === null && (
        <ul className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
          <li className="px-4 py-2 text-gray-400">
            {t('STATUS_PAGE.LOADING_SERVICES')}
          </li>
        </ul>
      )}
      {!servicesError && services?.length === 0 && (
        <ul className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
          <li className="px-4 py-2 text-gray-400">
            {t('STATUS_PAGE.NO_SERVICES')}
          </li>
        </ul>
      )}
      {!servicesError &&
        grouped &&
        STATUS_GROUP_ORDER.filter(group => grouped[group].length > 0).map(
          group => (
            <section key={group} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-4">
                <SectionHeading className="mb-0">
                  {t(STATUS_GROUP_LABEL_KEY[group])}
                </SectionHeading>
                {LEGEND_GROUPS.includes(group) && (
                  <button
                    type="button"
                    onClick={() => setLegendOpen(true)}
                    aria-label={t('STATUS_PAGE.LEGEND_BUTTON_LABEL')}
                    className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                )}
              </div>
              <ul className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {grouped[group].map(svc => (
                  <ServiceListItem key={svc.url} svc={svc} />
                ))}
              </ul>
            </section>
          ),
        )}

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
        </div>
      </section>
    </main>
  );
}
