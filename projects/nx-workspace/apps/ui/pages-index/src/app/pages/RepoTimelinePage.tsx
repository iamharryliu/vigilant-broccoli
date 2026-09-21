import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { DotPaths } from '@vigilant-broccoli/react-lib';
import en from '../i18n/en.json';
import { FULL_HEIGHT_PAGE_CLASS } from '../consts/layout';
import {
  DAY_KEY_LENGTH,
  REPO_TIMELINE_URL,
  RepoTimelineData,
  TIMELINE_GRANULARITY,
  TIMELINE_GRANULARITY_OPTIONS,
  TIMELINE_METRIC,
  TIMELINE_METRIC_OPTIONS,
  TIMELINE_VIEW,
  TIMELINE_VIEW_OPTIONS,
  TimelineBucket,
  TimelineGranularity,
  TimelineMetric,
  TimelineView,
  buildTimeline,
  toMonthNumber,
  toNiceTicks,
  toYearKey,
} from '../consts/repoTimeline';

const RepoScrollTimeline = lazy(
  () => import('../components/RepoScrollTimeline'),
);

const ICON_CLASS = 'h-4 w-4 shrink-0';
const AXIS_LABEL_ROW_CLASS = 'mt-2 h-4 shrink-0';
const PERIOD_START = '01';
const PERIOD_START_SUFFIX = `-${PERIOD_START}`;
const UTC = 'UTC';

const SLOT: Record<TimelineGranularity, { slot: number; bar: number }> = {
  [TIMELINE_GRANULARITY.DAY]: { slot: 8, bar: 6 },
  [TIMELINE_GRANULARITY.MONTH]: { slot: 24, bar: 16 },
  [TIMELINE_GRANULARITY.YEAR]: { slot: 96, bar: 24 },
};

const NUMBER_FORMAT = new Intl.NumberFormat();
const COMPACT_FORMAT = new Intl.NumberFormat(undefined, {
  notation: 'compact',
});

const PERIOD_FORMAT: Record<TimelineGranularity, Intl.DateTimeFormat> = {
  [TIMELINE_GRANULARITY.DAY]: new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: UTC,
  }),
  [TIMELINE_GRANULARITY.MONTH]: new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
    timeZone: UTC,
  }),
  [TIMELINE_GRANULARITY.YEAR]: new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    timeZone: UTC,
  }),
};

const SHORT_MONTH_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  timeZone: UTC,
});

const toDate = (key: string) =>
  new Date(key.padEnd(DAY_KEY_LENGTH, PERIOD_START_SUFFIX));

const formatPeriod = (key: string, granularity: TimelineGranularity) =>
  PERIOD_FORMAT[granularity].format(toDate(key));

const toAxisLabel = (
  key: string,
  index: number,
  granularity: TimelineGranularity,
) => {
  const year = toYearKey(key);
  if (granularity === TIMELINE_GRANULARITY.YEAR) return year;
  if (granularity === TIMELINE_GRANULARITY.MONTH) {
    return index === 0 || key.endsWith(PERIOD_START_SUFFIX) ? year : null;
  }
  if (!key.endsWith(PERIOD_START_SUFFIX)) return null;
  const month = SHORT_MONTH_FORMAT.format(toDate(key));
  return toMonthNumber(key) === PERIOD_START ? `${month} ${year}` : month;
};

interface SegmentedControlProps<T extends string> {
  labelKey: DotPaths<typeof en>;
  value: T;
  options: {
    value: T;
    labelKey: DotPaths<typeof en>;
    shortLabelKey?: DotPaths<typeof en>;
    Icon?: LucideIcon;
  }[];
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({
  labelKey,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  const { t } = useTranslation();
  const label = t(labelKey);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-fit rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
    >
      {options.map(option => {
        const optionLabel = t(option.labelKey);
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            aria-label={optionLabel}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition sm:px-3 sm:py-1.5 sm:text-sm',
              option.value === value
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
            )}
          >
            {option.Icon && <option.Icon className={ICON_CLASS} />}
            {option.shortLabelKey && (
              <span className="sm:hidden">{t(option.shortLabelKey)}</span>
            )}
            <span
              className={cn(
                (option.Icon || option.shortLabelKey) && 'hidden sm:inline',
              )}
            >
              {optionLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface TimelineChartProps {
  buckets: TimelineBucket[];
  metric: TimelineMetric;
  granularity: TimelineGranularity;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

function TimelineChart({
  buckets,
  metric,
  granularity,
  activeIndex,
  onActiveIndexChange,
}: TimelineChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ticks = toNiceTicks(Math.max(0, ...buckets.map(b => b[metric])));
  const scaleMax = ticks[ticks.length - 1];
  const { slot, bar } = SLOT[granularity];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [buckets]);

  return (
    <div className="flex min-h-0 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-6 pb-4 pr-2 sm:pr-4">
      <div
        className="flex w-9 shrink-0 flex-col text-[10px] text-gray-500 dark:text-gray-400 sm:w-12"
        aria-hidden
      >
        <div className="relative min-h-0 flex-1">
          {ticks.map(tick => (
            <span
              key={tick}
              className="absolute right-1.5 translate-y-1/2 tabular-nums sm:right-2"
              style={{ bottom: `${(tick / scaleMax) * 100}%` }}
            >
              {COMPACT_FORMAT.format(tick)}
            </span>
          ))}
        </div>
        <div className={AXIS_LABEL_ROW_CLASS} />
      </div>

      <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto">
        <div
          className="flex h-full flex-col"
          style={{ width: buckets.length * slot, minWidth: '100%' }}
        >
          <div className="relative min-h-0 flex-1">
            {ticks.map(tick => (
              <div
                key={tick}
                className="absolute inset-x-0 h-px bg-gray-100 dark:bg-gray-700"
                style={{ bottom: `${(tick / scaleMax) * 100}%` }}
              />
            ))}
            <div
              className="absolute inset-0 flex items-end"
              onMouseLeave={() => onActiveIndexChange(buckets.length - 1)}
            >
              {buckets.map((bucket, index) => (
                <div
                  key={bucket.key}
                  className="flex h-full shrink-0 cursor-pointer items-end justify-center"
                  style={{ width: slot }}
                  onMouseEnter={() => onActiveIndexChange(index)}
                  onClick={() => onActiveIndexChange(index)}
                >
                  <div
                    className={cn(
                      'rounded-t-[4px] transition-colors',
                      index === activeIndex
                        ? 'bg-sky-800 dark:bg-sky-200'
                        : 'bg-sky-500 dark:bg-sky-400',
                    )}
                    style={{
                      width: bar,
                      height: `${(bucket[metric] / scaleMax) * 100}%`,
                      minHeight: bucket[metric] > 0 ? 1 : 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              AXIS_LABEL_ROW_CLASS,
              'relative text-[10px] text-gray-500 dark:text-gray-400',
            )}
          >
            {buckets.map((bucket, index) => {
              const label = toAxisLabel(bucket.key, index, granularity);
              if (!label) return null;
              return (
                <span
                  key={bucket.key}
                  className="absolute whitespace-nowrap border-l border-gray-300 dark:border-gray-600 pl-1"
                  style={{ left: index * slot }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineViewProps {
  buckets: TimelineBucket[];
  metric: TimelineMetric;
  metricLabel: string;
  granularity: TimelineGranularity;
}

const formatTimelineValue = (value: number) =>
  NUMBER_FORMAT.format(Math.round(value));

function GraphView({
  buckets,
  metric,
  metricLabel,
  granularity,
}: TimelineViewProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => setActiveIndex(buckets.length - 1), [buckets]);

  const active = buckets[activeIndex];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {active && (
        <div className="mb-3" aria-live="polite">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metricLabel} · {formatPeriod(active.key, granularity)}
          </p>
          <p className="text-2xl font-semibold tabular-nums sm:text-3xl">
            {NUMBER_FORMAT.format(active[metric])}
          </p>
        </div>
      )}
      <TimelineChart
        buckets={buckets}
        metric={metric}
        granularity={granularity}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
      />
    </div>
  );
}

function ListView({
  buckets,
  metric,
  metricLabel,
  granularity,
}: TimelineViewProps) {
  const { t } = useTranslation();

  const entries = useMemo(
    () =>
      buckets
        .filter(bucket => bucket.periodCommits > 0)
        .map(bucket => ({
          id: bucket.key,
          label: formatPeriod(bucket.key, granularity),
          sublabel: t('REPO_TIMELINE_PAGE.ENTRY_SUMMARY', {
            commits: NUMBER_FORMAT.format(bucket.periodCommits),
            pullRequests: NUMBER_FORMAT.format(bucket.periodPullRequests),
            added: NUMBER_FORMAT.format(bucket.linesAdded),
            deleted: NUMBER_FORMAT.format(bucket.linesDeleted),
          }),
          value: bucket[metric],
        }))
        .reverse(),
    [buckets, granularity, metric, t],
  );

  return (
    <Suspense
      fallback={
        <p className="text-sm text-gray-400">
          {t('REPO_TIMELINE_PAGE.LOADING')}
        </p>
      }
    >
      <RepoScrollTimeline
        key={granularity}
        entries={entries}
        valueLabel={metricLabel}
        formatValue={formatTimelineValue}
      />
    </Suspense>
  );
}

export function RepoTimelinePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<RepoTimelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<TimelineMetric>(
    TIMELINE_METRIC.LINES_OF_CODE,
  );
  const [granularity, setGranularity] = useState<TimelineGranularity>(
    TIMELINE_GRANULARITY.MONTH,
  );
  const [view, setView] = useState<TimelineView>(TIMELINE_VIEW.GRAPH);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(REPO_TIMELINE_URL);
        if (!res.ok) {
          setError(t('REPO_TIMELINE_PAGE.ERROR', { message: res.status }));
          return;
        }
        setData(await res.json());
      } catch (err) {
        setError(
          t('REPO_TIMELINE_PAGE.ERROR', {
            message: err instanceof Error ? err.message : String(err),
          }),
        );
      }
    })();
  }, []);

  const buckets = useMemo(
    () => (data ? buildTimeline(data, granularity) : []),
    [data, granularity],
  );

  const metricOption =
    TIMELINE_METRIC_OPTIONS.find(option => option.value === metric) ??
    TIMELINE_METRIC_OPTIONS[0];
  const metricLabel = t(metricOption.labelKey);
  const viewProps = { buckets, metric, metricLabel, granularity };

  return (
    <main className={FULL_HEIGHT_PAGE_CLASS}>
      <PageHeader title={t('REPO_TIMELINE_PAGE.TITLE')} />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && !data && (
        <p className="text-sm text-gray-400">
          {t('REPO_TIMELINE_PAGE.LOADING')}
        </p>
      )}

      {data && (
        <>
          <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <SegmentedControl
              labelKey="REPO_TIMELINE_PAGE.VIEW_LABEL"
              value={view}
              onChange={setView}
              options={TIMELINE_VIEW_OPTIONS}
            />
            <SegmentedControl
              labelKey="REPO_TIMELINE_PAGE.METRIC_LABEL"
              value={metric}
              onChange={setMetric}
              options={TIMELINE_METRIC_OPTIONS}
            />
            <SegmentedControl
              labelKey="REPO_TIMELINE_PAGE.GRANULARITY_LABEL"
              value={granularity}
              onChange={setGranularity}
              options={TIMELINE_GRANULARITY_OPTIONS}
            />
          </div>

          {view === TIMELINE_VIEW.GRAPH ? (
            <GraphView {...viewProps} />
          ) : (
            <ListView {...viewProps} />
          )}
        </>
      )}
    </main>
  );
}
