import { ReactNode, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import {
  UPPTIME_SUMMARY_ERROR_TYPE,
  UpptimeSummary,
  UpptimeSummaryError,
} from '../hooks/useUpptimeSummary';
import {
  getDowntimeBarClass,
  getLastUtcDays,
  getUpptimeServiceDisplayText,
  UPTIME_STATUS,
  UPTIME_STATUS_DOT_CLASS,
  UpptimeService,
  UpptimeStatus,
} from '../utils/upptime.utils';

export interface UpptimeStatusListLabels {
  empty: string;
  legendTitle: string;
  legendButton: string;
  rangeDay: string;
  rangeWeek: string;
  rangeMonth: string;
  rangeYear: string;
  downtimeBar: (date: string, minutes: number) => string;
  errorStatus: (status: number) => string;
  errorFailed: (message: string) => string;
  status: Record<UpptimeStatus, { label: string; description: string }>;
}

export const DEFAULT_UPPTIME_STATUS_LIST_LABELS: UpptimeStatusListLabels = {
  empty: 'No services configured.',
  legendTitle: 'Status Legend',
  legendButton: 'Status legend',
  rangeDay: '24H',
  rangeWeek: '7D',
  rangeMonth: '30D',
  rangeYear: '1Y',
  downtimeBar: (date, minutes) => `${date}: ${minutes} min down`,
  errorStatus: status => `Status data unavailable (HTTP ${status}).`,
  errorFailed: message => `Failed to load status: ${message}`,
  status: {
    [UPTIME_STATUS.UP]: { label: 'Up', description: 'Responding normally.' },
    [UPTIME_STATUS.DOWN]: {
      label: 'Down',
      description: 'Not responding to health checks.',
    },
    [UPTIME_STATUS.DEGRADED]: {
      label: 'Degraded',
      description: 'Responding, but slower or with errors.',
    },
    [UPTIME_STATUS.UNKNOWN]: {
      label: 'Unknown',
      description: 'No recent check result.',
    },
  },
};

// Groups render in array order; a service joins the first group it matches,
// and a group without `match` collects every unmatched service.
export interface UpptimeServiceGroup {
  id: string;
  label: ReactNode;
  match?: (svc: UpptimeService) => boolean;
  showLegend?: boolean;
}

const LEGEND_STATUS_ORDER: UpptimeStatus[] = [
  UPTIME_STATUS.UP,
  UPTIME_STATUS.DEGRADED,
  UPTIME_STATUS.DOWN,
  UPTIME_STATUS.UNKNOWN,
];

const LIST_CLASS =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm';

const ROW_CLASS = 'flex items-center gap-4 px-4 py-2';

const UPTIME_COLUMN_CLASS =
  'shrink-0 font-mono text-gray-400 items-baseline gap-1.5';

const byDisplayText = (a: UpptimeService, b: UpptimeService) =>
  getUpptimeServiceDisplayText(a).localeCompare(
    getUpptimeServiceDisplayText(b),
  );

const groupServices = (
  services: UpptimeService[],
  groups: UpptimeServiceGroup[],
) => {
  const buckets = new Map<string, UpptimeService[]>(
    groups.map(group => [group.id, []]),
  );
  const fallback = groups.find(group => !group.match);
  services.forEach(svc => {
    const group = groups.find(g => g.match?.(svc)) ?? fallback;
    if (group) buckets.get(group.id)?.push(svc);
  });
  return groups
    .map(group => ({
      group,
      services: (buckets.get(group.id) ?? []).sort(byDisplayText),
    }))
    .filter(({ services }) => services.length > 0);
};

function UptimeCell({
  label,
  value,
  className = 'flex',
  loading = false,
}: {
  label: string;
  value?: string;
  className?: string;
  loading?: boolean;
}) {
  return (
    <span className={`${className} ${UPTIME_COLUMN_CLASS}`}>
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="relative w-[7ch] shrink-0 text-right">
        {loading ? (
          <>
            <span className="invisible">—</span>
            <Skeleton className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 dark:bg-border motion-reduce:animate-none" />
          </>
        ) : (
          value || '—'
        )}
      </span>
    </span>
  );
}

function UptimeListItem({
  svc,
  days,
  labels,
  loading = false,
}: {
  svc: UpptimeService;
  loading?: boolean;
  days: string[];
  labels: UpptimeStatusListLabels;
}) {
  const status =
    svc.status in UPTIME_STATUS_DOT_CLASS ? svc.status : UPTIME_STATUS.UNKNOWN;
  const Row = loading ? 'div' : 'a';
  return (
    <li aria-hidden={loading || undefined}>
      <Row
        {...(loading
          ? {}
          : { href: svc.url, target: '_blank', rel: 'noopener noreferrer' })}
        className={`${ROW_CLASS} ${loading ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition'}`}
      >
        <span
          className={`h-2 w-2 rounded-full ${loading ? 'bg-muted dark:bg-border' : UPTIME_STATUS_DOT_CLASS[status]} shrink-0`}
          title={loading ? undefined : labels.status[status].label}
        />
        <span className="flex-1 font-medium truncate">
          {loading ? (
            <Skeleton className="h-4 w-3/4 dark:bg-border motion-reduce:animate-none" />
          ) : (
            getUpptimeServiceDisplayText(svc)
          )}
        </span>
        <span className="hidden md:flex shrink-0 items-center gap-px">
          {days.map(day => {
            const minutes = svc.dailyMinutesDown?.[day] ?? 0;
            return (
              <span
                key={day}
                className={`h-4 w-1 ${loading ? 'bg-muted dark:bg-border' : getDowntimeBarClass(minutes)}`}
                title={loading ? undefined : labels.downtimeBar(day, minutes)}
              />
            );
          })}
        </span>
        <UptimeCell
          loading={loading}
          className="hidden sm:flex"
          label={labels.rangeDay}
          value={svc.uptimeDay}
        />
        <UptimeCell
          loading={loading}
          className="hidden sm:flex"
          label={labels.rangeWeek}
          value={svc.uptimeWeek}
        />
        <UptimeCell
          loading={loading}
          label={labels.rangeMonth}
          value={svc.uptimeMonth}
        />
        <UptimeCell
          loading={loading}
          className="hidden sm:flex"
          label={labels.rangeYear}
          value={svc.uptimeYear}
        />
        <span className="relative shrink-0 font-mono text-muted-foreground w-14 text-right">
          {loading ? (
            <>
              <span className="invisible">—</span>
              <Skeleton className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 dark:bg-border motion-reduce:animate-none" />
            </>
          ) : typeof svc.time === 'number' ? (
            `${svc.time}ms`
          ) : (
            '—'
          )}
        </span>
      </Row>
    </li>
  );
}

function UpptimeLegendDialog({
  open,
  onOpenChange,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: UpptimeStatusListLabels;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{labels.legendTitle}</DialogTitle>
        </DialogHeader>
        <ul className="space-y-3 text-sm">
          {LEGEND_STATUS_ORDER.map(status => (
            <li key={status} className="flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${UPTIME_STATUS_DOT_CLASS[status]} shrink-0`}
              />
              <span>
                <span className="font-medium">
                  {labels.status[status].label}
                </span>
                <span className="block text-gray-500 dark:text-gray-400">
                  {labels.status[status].description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

const toErrorMessage = (
  error: UpptimeSummaryError,
  labels: UpptimeStatusListLabels,
) =>
  error.type === UPPTIME_SUMMARY_ERROR_TYPE.STATUS
    ? labels.errorStatus(error.status)
    : labels.errorFailed(error.message);

interface UpptimeStatusListProps {
  summary: UpptimeSummary;
  loadingServices?: Pick<UpptimeService, 'name' | 'url'>[];
  // Omit for one flat, unheaded list.
  groups?: UpptimeServiceGroup[];
  labels?: Partial<UpptimeStatusListLabels>;
}

export function UpptimeStatusList({
  summary,
  loadingServices,
  groups,
  labels: labelOverrides,
}: UpptimeStatusListProps) {
  const [legendOpen, setLegendOpen] = useState(false);
  const labels = { ...DEFAULT_UPPTIME_STATUS_LIST_LABELS, ...labelOverrides };
  const { services, error } = summary;
  const days = getLastUtcDays();

  if (error)
    return (
      <ul className={LIST_CLASS}>
        <li className="px-4 py-2 text-red-500">
          {toErrorMessage(error, labels)}
        </li>
      </ul>
    );
  const loading = services === null;
  const items =
    services ??
    loadingServices?.map(svc => ({ ...svc, status: UPTIME_STATUS.UNKNOWN })) ??
    [];

  if (items.length === 0)
    return (
      <ul className={LIST_CLASS} aria-busy={loading}>
        <li className="px-4 py-2 text-muted-foreground">
          {services && labels.empty}
        </li>
      </ul>
    );

  const renderList = (items: UpptimeService[]) => (
    <ul
      aria-busy={loading}
      className={`${LIST_CLASS} divide-y divide-gray-100 dark:divide-gray-700`}
    >
      {items.map(svc => (
        <UptimeListItem
          key={svc.url}
          svc={svc}
          days={days}
          labels={labels}
          loading={loading}
        />
      ))}
    </ul>
  );

  if (!groups) return renderList([...items].sort(byDisplayText));

  return (
    <>
      <UpptimeLegendDialog
        open={legendOpen}
        onOpenChange={setLegendOpen}
        labels={labels}
      />
      {groupServices(items, groups).map(({ group, services: items }) => (
        <section key={group.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {group.label}
            </h2>
            {group.showLegend && (
              <button
                type="button"
                onClick={() => setLegendOpen(true)}
                aria-label={labels.legendButton}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <CircleHelp className="h-4 w-4" />
              </button>
            )}
          </div>
          {renderList(items)}
        </section>
      ))}
    </>
  );
}
