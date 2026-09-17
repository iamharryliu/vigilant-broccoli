import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { DotPaths } from '@vigilant-broccoli/react-lib';
import en from '../i18n/en.json';
import {
  DAY_KEY_LENGTH,
  REPO_TIMELINE_URL,
  RepoTimelineData,
  TIMELINE_GRANULARITY,
  TIMELINE_GRANULARITY_OPTIONS,
  TIMELINE_METRIC,
  TIMELINE_METRIC_OPTIONS,
  TIMELINE_ORDER,
  TIMELINE_ORDER_OPTIONS,
  TIMELINE_VIEW,
  TIMELINE_VIEW_OPTIONS,
  TimelineBucket,
  TimelineGranularity,
  TimelineMetric,
  TimelineOrder,
  TimelineView,
  buildTimeline,
  toMonthNumber,
  toNiceTicks,
  toYearKey,
} from '../consts/repoTimeline';

const RepoScrollTimeline = lazy(
  () => import('../components/RepoScrollTimeline'),
);

const CHART_HEIGHT = 240;
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
  options: { value: T; labelKey: DotPaths<typeof en> }[];
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
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md border px-3 py-1 text-sm transition',
            option.value === value
              ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500',
          )}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className="mt-1 text-xl font-semibold"
        title={NUMBER_FORMAT.format(value)}
      >
        {COMPACT_FORMAT.format(value)}
      </p>
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
    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-6 pb-4 pr-4">
      <div
        className="relative w-12 shrink-0 text-[10px] text-gray-500 dark:text-gray-400"
        style={{ height: CHART_HEIGHT }}
        aria-hidden
      >
        {ticks.map(tick => (
          <span
            key={tick}
            className="absolute right-2 translate-y-1/2 tabular-nums"
            style={{ bottom: `${(tick / scaleMax) * 100}%` }}
          >
            {COMPACT_FORMAT.format(tick)}
          </span>
        ))}
      </div>

      <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto pb-2">
        <div
          className="relative"
          style={{ width: buckets.length * slot, minWidth: '100%' }}
        >
          <div className="relative" style={{ height: CHART_HEIGHT }}>
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

          <div className="relative mt-2 h-4 text-[10px] text-gray-500 dark:text-gray-400">
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
    <>
      {active && (
        <div className="mb-3" aria-live="polite">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {metricLabel} · {formatPeriod(active.key, granularity)}
          </p>
          <p className="text-3xl font-semibold tabular-nums">
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
    </>
  );
}

function ListView({
  buckets,
  metric,
  metricLabel,
  granularity,
}: TimelineViewProps) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<TimelineOrder>(
    TIMELINE_ORDER.NEWEST_FIRST,
  );

  const entries = useMemo(() => {
    const chronological = buckets
      .filter(bucket => bucket.commits > 0)
      .map(bucket => ({
        id: bucket.key,
        label: formatPeriod(bucket.key, granularity),
        sublabel: t('REPO_TIMELINE_PAGE.ENTRY_SUMMARY', {
          commits: NUMBER_FORMAT.format(bucket.commits),
          pullRequests: NUMBER_FORMAT.format(bucket.pullRequests),
          added: NUMBER_FORMAT.format(bucket.linesAdded),
          deleted: NUMBER_FORMAT.format(bucket.linesDeleted),
        }),
        value: bucket[metric],
      }));
    return order === TIMELINE_ORDER.NEWEST_FIRST
      ? chronological.reverse()
      : chronological;
  }, [buckets, granularity, metric, order]);

  return (
    <>
      <div className="mb-4">
        <SegmentedControl
          labelKey="REPO_TIMELINE_PAGE.ORDER_LABEL"
          value={order}
          onChange={setOrder}
          options={TIMELINE_ORDER_OPTIONS}
        />
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-gray-400">
            {t('REPO_TIMELINE_PAGE.LOADING')}
          </p>
        }
      >
        <RepoScrollTimeline
          key={`${granularity}-${order}`}
          entries={entries}
          valueLabel={metricLabel}
          formatValue={formatTimelineValue}
        />
      </Suspense>
    </>
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

  const totals = useMemo(
    () =>
      buckets.reduce(
        (acc, b) => ({
          commits: acc.commits + b.commits,
          pullRequests: acc.pullRequests + b.pullRequests,
        }),
        { commits: 0, pullRequests: 0 },
      ),
    [buckets],
  );

  const metricOption =
    TIMELINE_METRIC_OPTIONS.find(option => option.value === metric) ??
    TIMELINE_METRIC_OPTIONS[0];
  const metricLabel = t(metricOption.labelKey);
  const viewProps = { buckets, metric, metricLabel, granularity };

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-16">
      <PageHeader title={t('REPO_TIMELINE_PAGE.TITLE')} />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && !data && (
        <p className="text-sm text-gray-400">
          {t('REPO_TIMELINE_PAGE.LOADING')}
        </p>
      )}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatTile
              label={t('REPO_TIMELINE_PAGE.METRIC_LINES_OF_CODE')}
              value={buckets[buckets.length - 1]?.linesOfCode ?? 0}
            />
            <StatTile
              label={t('REPO_TIMELINE_PAGE.METRIC_COMMITS')}
              value={totals.commits}
            />
            <StatTile
              label={t('REPO_TIMELINE_PAGE.METRIC_PULL_REQUESTS')}
              value={totals.pullRequests}
            />
          </div>

          <div className="mb-4 flex flex-col gap-2">
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
