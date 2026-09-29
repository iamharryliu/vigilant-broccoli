import {
  Dispatch,
  SetStateAction,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  TIMELINE_RANGE,
  TIMELINE_RANGE_OPTIONS,
  TIMELINE_VIEW,
  TIMELINE_VIEW_OPTIONS,
  TimelineBucket,
  TimelineGranularity,
  TimelineMetric,
  TimelineRange,
  TimelineView,
  buildTimeline,
  getGraphWindowSize,
  toMonthNumber,
  toNiceTicks,
  toYearKey,
} from '../consts/repoTimeline';

const RepoScrollTimeline = lazy(
  () => import('../components/RepoScrollTimeline'),
);

const SESSION_STORAGE_KEY = {
  VIEW: 'repo-timeline:view',
  RANGE: 'repo-timeline:range',
  GRANULARITY: 'repo-timeline:granularity',
  METRIC: 'repo-timeline:metric',
} as const;

function useSessionState<T extends string>(
  key: string,
  defaultValue: T,
  validValues: readonly T[],
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.sessionStorage.getItem(key);
      return stored && (validValues as readonly string[]).includes(stored)
        ? (stored as T)
        : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // sessionStorage unavailable — not persisted this session
    }
  }, [key, value]);

  return [value, setValue];
}

const ICON_CLASS = 'h-4 w-4 shrink-0';
const AXIS_LABEL_ROW_CLASS = 'mt-2 h-4 shrink-0';
const TOP_LABEL_ROW_CLASS = 'mb-2 h-4 shrink-0';
const PERIOD_START = '01';
const PERIOD_START_SUFFIX = `-${PERIOD_START}`;
const UTC = 'UTC';

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

const YEAR_ONLY_AXIS_RANGES: TimelineRange[] = [
  TIMELINE_RANGE.YEAR_2,
  TIMELINE_RANGE.ALL,
];

const DAY_LABEL_RANGES: TimelineRange[] = [
  TIMELINE_RANGE.WEEK_1,
  TIMELINE_RANGE.MONTH_1,
];
const MONTH_DAY_LABEL_INTERVAL = 5;

interface AxisLabel {
  text: string;
  showOnMobile: boolean;
}

const MONTH_DAY_MOBILE_INTERVAL = MONTH_DAY_LABEL_INTERVAL * 2;

const toAxisLabel = (
  key: string,
  index: number,
  granularity: TimelineGranularity,
  range: TimelineRange,
): AxisLabel | null => {
  const year = toYearKey(key);
  if (granularity === TIMELINE_GRANULARITY.YEAR) {
    return { text: year, showOnMobile: true };
  }
  if (granularity === TIMELINE_GRANULARITY.MONTH) {
    return index === 0 || key.endsWith(PERIOD_START_SUFFIX)
      ? { text: year, showOnMobile: true }
      : null;
  }
  const monthNumber = toMonthNumber(key);
  const isMonthStart = key.endsWith(PERIOD_START_SUFFIX);
  const isJanuaryStart = isMonthStart && monthNumber === PERIOD_START;
  const month = SHORT_MONTH_FORMAT.format(toDate(key));
  if (YEAR_ONLY_AXIS_RANGES.includes(range)) {
    return index === 0 || isJanuaryStart
      ? { text: year, showOnMobile: true }
      : null;
  }
  if (DAY_LABEL_RANGES.includes(range)) {
    const day = toDate(key).getUTCDate();
    if (isMonthStart) return { text: `${month} ${day}`, showOnMobile: true };
    if (range !== TIMELINE_RANGE.MONTH_1) {
      return { text: String(day), showOnMobile: true };
    }
    if (day % MONTH_DAY_LABEL_INTERVAL !== 0) return null;
    return {
      text: String(day),
      showOnMobile: day % MONTH_DAY_MOBILE_INTERVAL === 0,
    };
  }
  if (!isMonthStart) return null;
  return {
    text: isJanuaryStart ? `${month} ${year}` : month,
    showOnMobile: isJanuaryStart || Number(monthNumber) % 2 === 1,
  };
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

interface RangeSelectorProps {
  value: TimelineRange;
  onChange: (value: TimelineRange) => void;
}

function RangeSelector({ value, onChange }: RangeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={t('REPO_TIMELINE_PAGE.RANGE_LABEL')}
      className="mb-2 flex shrink-0 gap-0.5 overflow-x-auto"
    >
      {TIMELINE_RANGE_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'shrink-0 rounded-md px-2 py-1 text-xs font-medium tabular-nums transition sm:text-sm',
            option.value === value
              ? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100',
          )}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}

interface TimelineChartProps {
  buckets: TimelineBucket[];
  metric: TimelineMetric;
  granularity: TimelineGranularity;
  range: TimelineRange;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

function TimelineChart({
  buckets,
  metric,
  granularity,
  range,
  activeIndex,
  onActiveIndexChange,
}: TimelineChartProps) {
  const [isHovering, setIsHovering] = useState(false);

  const values = buckets.map(b => b[metric]);
  const ticks = toNiceTicks(
    values.length > 0 ? Math.min(...values) : 0,
    values.length > 0 ? Math.max(...values) : 0,
  );
  const scaleMin = ticks[0];
  const scaleMax = ticks[ticks.length - 1];
  const scaleSpan = scaleMax - scaleMin;
  const toPercent = (value: number) => ((value - scaleMin) / scaleSpan) * 100;
  const slotPercent = buckets.length > 0 ? 100 / buckets.length : 0;

  const hoverBucket = isHovering ? buckets[activeIndex] : undefined;
  const hoverX = `${(activeIndex + 0.5) * slotPercent}%`;

  return (
    <div className="flex min-h-0 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-6 pb-4 pr-2 sm:pr-4">
      <div
        className="flex w-9 shrink-0 flex-col text-[10px] text-gray-500 dark:text-gray-400 sm:w-12"
        aria-hidden
      >
        <div className={TOP_LABEL_ROW_CLASS} />
        <div className="relative min-h-0 flex-1">
          {ticks.map(tick => (
            <span
              key={tick}
              className="absolute right-1.5 translate-y-1/2 tabular-nums sm:right-2"
              style={{ bottom: `${toPercent(tick)}%` }}
            >
              {COMPACT_FORMAT.format(tick)}
            </span>
          ))}
        </div>
        <div className={AXIS_LABEL_ROW_CLASS} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className={cn(TOP_LABEL_ROW_CLASS, 'relative')}>
          {hoverBucket && (
            <span
              className="absolute -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white dark:bg-gray-100 dark:text-gray-900"
              style={{ left: hoverX }}
            >
              {formatPeriod(hoverBucket.key, granularity)} ·{' '}
              {NUMBER_FORMAT.format(hoverBucket[metric])}
            </span>
          )}
        </div>
        <div className="relative min-h-0 flex-1">
          {ticks.map(tick => (
            <div
              key={tick}
              className="absolute inset-x-0 h-px bg-gray-100 dark:bg-gray-700"
              style={{ bottom: `${toPercent(tick)}%` }}
            />
          ))}
          {isHovering && (
            <div
              aria-hidden
              className="absolute inset-y-0 w-px bg-gray-400 dark:bg-gray-500"
              style={{ left: hoverX }}
            />
          )}
          <div
            className="absolute inset-0 flex items-end"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              onActiveIndexChange(buckets.length - 1);
            }}
          >
            {buckets.map((bucket, index) => (
              <div
                key={bucket.key}
                className="flex h-full min-w-0 flex-1 cursor-pointer items-end justify-center"
                onMouseEnter={() => onActiveIndexChange(index)}
                onClick={() => onActiveIndexChange(index)}
              >
                <div
                  className={cn(
                    'w-4/5 rounded-t-[4px] transition-colors',
                    index === activeIndex
                      ? 'bg-sky-800 dark:bg-sky-200'
                      : 'bg-sky-500 dark:bg-sky-400',
                  )}
                  style={{
                    height: `${toPercent(bucket[metric])}%`,
                    minHeight: bucket[metric] > scaleMin ? 1 : 0,
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
            const label = toAxisLabel(bucket.key, index, granularity, range);
            if (!label) return null;
            return (
              <span
                key={bucket.key}
                className={cn(
                  'absolute whitespace-nowrap border-l border-gray-300 dark:border-gray-600 pl-1',
                  !label.showOnMobile && 'hidden sm:inline',
                )}
                style={{ left: `${index * slotPercent}%` }}
              >
                {label.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface GraphViewProps {
  buckets: TimelineBucket[];
  metric: TimelineMetric;
  range: TimelineRange;
}

interface ListViewProps {
  buckets: TimelineBucket[];
  metric: TimelineMetric;
  metricLabel: string;
  granularity: TimelineGranularity;
}

const formatTimelineValue = (value: number) =>
  NUMBER_FORMAT.format(Math.round(value));

function GraphView({ buckets, metric, range }: GraphViewProps) {
  const windowedBuckets = useMemo(() => {
    const windowSize = getGraphWindowSize(range, buckets.length);
    return buckets.slice(-windowSize);
  }, [buckets, range]);

  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(
    () => setActiveIndex(windowedBuckets.length - 1),
    [windowedBuckets],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TimelineChart
        buckets={windowedBuckets}
        metric={metric}
        granularity={TIMELINE_GRANULARITY.DAY}
        range={range}
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
}: ListViewProps) {
  const { t } = useTranslation();

  const entries = useMemo(
    () =>
      buckets
        .filter(bucket => bucket.periodCommits > 0)
        .map(bucket => ({
          id: bucket.key,
          label: formatPeriod(bucket.key, granularity),
          sublabel: (
            <>
              {t('REPO_TIMELINE_PAGE.ENTRY_SUMMARY', {
                commits: NUMBER_FORMAT.format(bucket.periodCommits),
                pullRequests: NUMBER_FORMAT.format(bucket.periodPullRequests),
              })}{' '}
              ·{' '}
              <span className="text-green-600 dark:text-green-400">
                +{NUMBER_FORMAT.format(bucket.linesAdded)}
              </span>{' '}
              /{' '}
              <span className="text-red-600 dark:text-red-400">
                −{NUMBER_FORMAT.format(bucket.linesDeleted)}
              </span>
            </>
          ),
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
  const [metric, setMetric] = useSessionState<TimelineMetric>(
    SESSION_STORAGE_KEY.METRIC,
    TIMELINE_METRIC.LINES_OF_CODE,
    Object.values(TIMELINE_METRIC),
  );
  const [granularity, setGranularity] = useSessionState<TimelineGranularity>(
    SESSION_STORAGE_KEY.GRANULARITY,
    TIMELINE_GRANULARITY.MONTH,
    Object.values(TIMELINE_GRANULARITY),
  );
  const [view, setView] = useSessionState<TimelineView>(
    SESSION_STORAGE_KEY.VIEW,
    TIMELINE_VIEW.GRAPH,
    Object.values(TIMELINE_VIEW),
  );
  const [range, setRange] = useSessionState<TimelineRange>(
    SESSION_STORAGE_KEY.RANGE,
    TIMELINE_RANGE.MONTH_1,
    Object.values(TIMELINE_RANGE),
  );

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

  const dayBuckets = useMemo(
    () => (data ? buildTimeline(data, TIMELINE_GRANULARITY.DAY) : []),
    [data],
  );
  const listBuckets = useMemo(
    () => (data ? buildTimeline(data, granularity) : []),
    [data, granularity],
  );

  const metricOption =
    TIMELINE_METRIC_OPTIONS.find(option => option.value === metric) ??
    TIMELINE_METRIC_OPTIONS[0];
  const metricLabel = t(metricOption.labelKey);

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
            {view === TIMELINE_VIEW.TIMELINE && (
              <SegmentedControl
                labelKey="REPO_TIMELINE_PAGE.GRANULARITY_LABEL"
                value={granularity}
                onChange={setGranularity}
                options={TIMELINE_GRANULARITY_OPTIONS}
              />
            )}
          </div>

          {view === TIMELINE_VIEW.GRAPH && (
            <RangeSelector value={range} onChange={setRange} />
          )}

          {view === TIMELINE_VIEW.GRAPH ? (
            <GraphView buckets={dayBuckets} metric={metric} range={range} />
          ) : (
            <ListView
              buckets={listBuckets}
              metric={metric}
              metricLabel={metricLabel}
              granularity={granularity}
            />
          )}
        </>
      )}
    </main>
  );
}
