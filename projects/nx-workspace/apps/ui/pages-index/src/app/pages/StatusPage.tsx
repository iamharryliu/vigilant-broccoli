import { useEffect, useState } from 'react';
import { GithubActionsBadges } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';

const REPO_OWNER = 'iamharryliu';
const REPO_NAME = 'vigilant-broccoli';
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const SUMMARY_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/history/summary.json`;
const HISTORY_URL = `${REPO_URL}/tree/main/history`;
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
  { dot: string; label: string; text: string }
> = {
  up: {
    dot: 'bg-emerald-500',
    label: 'Up',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    dot: 'bg-red-500',
    label: 'Down',
    text: 'text-red-600 dark:text-red-400',
  },
  degraded: {
    dot: 'bg-amber-500',
    label: 'Degraded',
    text: 'text-amber-600 dark:text-amber-400',
  },
  unknown: {
    dot: 'bg-gray-400',
    label: 'Unknown',
    text: 'text-gray-400',
  },
};

interface StatusPageProps {
  wrapped?: boolean;
}

export function StatusPage({ wrapped = true }: StatusPageProps) {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceStatus[] | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);

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
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-4">
        <PageHeader
          title={t('STATUS_PAGE.TITLE')}
          description={
            <>
              {t('STATUS_PAGE.DESCRIPTION_PREFIX')}{' '}
              <a
                href="https://upptime.js.org"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('STATUS_PAGE.UPPTIME')}
              </a>
              . {updated && <span>{updated}</span>}
            </>
          }
        />
      </header>

      <ul className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 text-sm">
        {servicesError && (
          <li className="px-4 py-2 text-red-500">{servicesError}</li>
        )}
        {!servicesError && services === null && (
          <li className="px-4 py-2 text-gray-400">
            {t('STATUS_PAGE.LOADING_SERVICES')}
          </li>
        )}
        {!servicesError && services?.length === 0 && (
          <li className="px-4 py-2 text-gray-400">
            {t('STATUS_PAGE.NO_SERVICES')}
          </li>
        )}
        {!servicesError &&
          services?.map(svc => {
            const status = STATUS_COLORS[svc.status] ?? STATUS_COLORS.unknown;
            return (
              <li key={svc.url}>
                <a
                  href={svc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${status.dot} shrink-0`}
                  />
                  <span className="flex-1 font-medium truncate">
                    {svc.name}
                  </span>
                  <span className={`shrink-0 ${status.text}`}>
                    {status.label}
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
          })}
      </ul>

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

      <footer className="mt-6 text-xs text-gray-400">
        {t('STATUS_PAGE.RAW_HISTORY')}{' '}
        <a
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          href={HISTORY_URL}
        >
          github.com/.../history
        </a>
      </footer>
    </main>
  );
}
