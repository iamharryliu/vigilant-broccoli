'use client';

import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CloudRain, Droplets, LucideIcon, Wind } from 'lucide-react';
import {
  formatLocalTime,
  formatMoonIllumination,
  getMoonPhase,
  getOrderedSunEvents,
  LocalWeather,
  Location,
  Preparation,
  toDisplayTemperature,
  WEATHER_CONDITION,
} from '@vigilant-broccoli/common-js';
import {
  cn,
  LOCAL_WEATHER_STATUS,
  LocalWeatherFailure,
  LocalWeatherMessage,
  PREPARATION_BADGES,
  Skeleton,
  TextProps,
  useLocalWeather,
  useWeatherTranslation,
  WeatherBadgeList,
  WeatherI18nProvider,
} from '@vigilant-broccoli/react-lib';
import { ClockComponent } from '../clock';
import { ForecastCarousel } from './weather-clock-card-forecast';
import {
  SUN_EVENT_LUCIDE_ICON,
  weatherLucideIcon,
} from './weather-clock-card-icons';

const CLOCK_TIME_SIZE: TextProps['size'] = '6';

const TICK_MS = 60 * 1000;

const TILE_ICON_SIZE = 22;
const TILE_ICON_STROKE = 1.75;
const TILE_COUNT = 4;
const DEGREES_CELSIUS = '°C';
// Viewport breakpoints ignore a narrow card on a wide screen (sandbox, sidebar
// layouts), so the compact feels-like follows the card's own width.
const COMPACT_CARD_MAX_WIDTH_PX = 420;
const WEATHER_TILE_TITLE = 'Weather';
const MOON_TILE_KEY = 'Moon';
const SECONDS_PER_MINUTE = 60;
const SEPARATOR = '·';
const TITLE_SEPARATOR = ' — ';
const PRECIPITATION_DECIMALS = 10;

const FAILURE_STATUSES: string[] = [
  LOCAL_WEATHER_STATUS.LOCATION_DENIED,
  LOCAL_WEATHER_STATUS.LOCATION_UNAVAILABLE,
  LOCAL_WEATHER_STATUS.WEATHER_ERROR,
];

const CARD_CLASS =
  'flex w-full flex-col gap-4 rounded-xl border border-[var(--gray-6)] bg-[color-mix(in_srgb,var(--color-background)_50%,transparent)] p-4 shadow-lg';
const CARD_TOGGLE_CLASS =
  'cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gray-8)]';
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea';
const SUMMARY_CLASS =
  'flex flex-wrap items-center justify-center gap-x-6 gap-y-4';
const HERO_CLASS = 'flex min-w-max flex-col items-center gap-1.5';
const TILE_GRID_CLASS =
  'grid grid-cols-[repeat(2,minmax(6.5rem,1fr))] gap-x-5 gap-y-3';
const TILE_CLASS = 'flex min-w-[6.5rem] items-center gap-2 text-left';
const TILE_ICON_CLASS = 'flex items-center text-2xl text-[var(--gray-11)]';
const TILE_TEXT_CLASS = 'flex min-w-0 flex-col';
const TILE_VALUE_CLASS = 'flex items-center gap-1 text-[0.85rem] font-semibold';
const TILE_LABEL_CLASS =
  'overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem] text-[var(--gray-11)]';
const ATTRIBUTION_CLASS = 'text-center text-[0.65rem] text-[var(--gray-11)]';
const PLACEHOLDER_WEATHER: LocalWeather = {
  city: null,
  temperatureC: 0,
  feelsLikeC: 0,
  highC: 0,
  lowC: 0,
  humidityPercent: 0,
  windSpeedKph: 0,
  windMaxKph: 0,
  precipitationMm: 0,
  precipitationSumMm: 0,
  condition: WEATHER_CONDITION.CLEAR,
  isDay: true,
};
const INVISIBLE_CLASS = 'invisible';
const DETAIL_TILES_CLASS = 'flex flex-wrap justify-center gap-x-5 gap-y-3';

export interface WeatherClockCardWeather extends LocalWeather {
  preparation?: Preparation | null;
}

export interface WeatherClockCardProps {
  location?: Location;
  timezoneOffsetSeconds?: number;
  weather?: WeatherClockCardWeather;
  loading?: boolean;
  error?: LocalWeatherFailure;
  onRetry?: () => void;
  preparationLoading?: boolean;
  fetchWeather?: (location: Location) => Promise<LocalWeather | null>;
  fetchPreparation?: (weather: LocalWeather) => Promise<Preparation | null>;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

interface StatTile {
  key: string;
  icon: ReactNode;
  value: string;
  valueNote?: ReactNode;
  valueDetail?: ReactNode;
  label: string;
  title?: string;
}

const TileIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <Icon size={TILE_ICON_SIZE} strokeWidth={TILE_ICON_STROKE} />
);

const StatTileView = ({ tile }: { tile: StatTile }) => (
  <div title={tile.title} className={TILE_CLASS}>
    <span className={TILE_ICON_CLASS}>{tile.icon}</span>
    <div className={TILE_TEXT_CLASS}>
      <span className={TILE_VALUE_CLASS}>
        <span>
          {tile.value}
          {tile.valueNote}
        </span>
        {tile.valueDetail}
      </span>
      <span className={TILE_LABEL_CLASS}>{tile.label}</span>
    </div>
  </div>
);

const SkeletonTileView = () => (
  <div className={TILE_CLASS}>
    <Skeleton className="h-6 w-6 rounded-full" />
    <div className={cn(TILE_TEXT_CLASS, 'flex-1 gap-1')}>
      <Skeleton className="h-3.5 w-10" />
      <Skeleton className="h-2.5 w-14" />
    </div>
  </div>
);

const getBrowserTimezoneOffsetSeconds = (): number =>
  -new Date().getTimezoneOffset() * SECONDS_PER_MINUTE;

interface WeatherDetailsProps {
  weather: WeatherClockCardWeather;
  loading: boolean;
  preparationLoading: boolean;
}

const WeatherDetails = ({
  weather,
  loading,
  preparationLoading,
}: WeatherDetailsProps) => {
  const { t } = useWeatherTranslation();
  const {
    humidityPercent,
    windSpeedKph,
    windMaxKph,
    precipitationMm,
    precipitationSumMm,
    preparation,
  } = weather;
  const roundPrecipitation = (mm: number) =>
    Math.round(mm * PRECIPITATION_DECIMALS) / PRECIPITATION_DECIMALS;

  const detailTiles: StatTile[] = [
    {
      key: 'humidity',
      icon: <TileIcon icon={Droplets} />,
      value: `${Math.round(humidityPercent)}%`,
      label: t('WEATHER.HUMIDITY'),
    },
    {
      key: 'wind',
      icon: <TileIcon icon={Wind} />,
      value: t('WEATHER.WIND_VALUE', { speed: Math.round(windSpeedKph) }),
      label: t('WEATHER.WIND_MAX', { max: Math.round(windMaxKph) }),
    },
    {
      key: 'precipitation',
      icon: <TileIcon icon={CloudRain} />,
      value: t('WEATHER.PRECIPITATION_VALUE', {
        amount: roundPrecipitation(precipitationMm),
      }),
      label: t('WEATHER.PRECIPITATION_SUM', {
        sum: roundPrecipitation(precipitationSumMm),
      }),
    },
  ];

  const badges = PREPARATION_BADGES.filter(({ key }) => preparation?.[key]).map(
    ({ key, icon, labelKey }) => ({ key, icon, label: t(labelKey) }),
  );

  // The details block stays rendered (hidden while loading) and the badge row
  // keeps a fixed height while data is pending so the card does not jump; once
  // loaded with no badges the row is dropped instead of leaving empty space.
  const isBadgeRowPending = preparationLoading || loading;
  const showBadgeRow = isBadgeRowPending || badges.length > 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(DETAIL_TILES_CLASS, loading && INVISIBLE_CLASS)}
        aria-hidden={loading || undefined}
      >
        {detailTiles.map(tile => (
          <StatTileView key={tile.key} tile={tile} />
        ))}
      </div>
      {showBadgeRow && (
        <div className="flex min-h-[1.75rem] items-center justify-center">
          {isBadgeRowPending ? (
            <div
              className="flex gap-2"
              role={loading ? undefined : 'status'}
              aria-label={loading ? undefined : t('STATUS.LOADING_PREPARATION')}
            >
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          ) : (
            <WeatherBadgeList badges={badges} />
          )}
        </div>
      )}
    </div>
  );
};

const WeatherClockCardView = ({
  location,
  timezoneOffsetSeconds,
  weather,
  loading = false,
  error,
  onRetry,
  preparationLoading = false,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: WeatherClockCardProps) => {
  const { t } = useWeatherTranslation();
  const forecastId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const moonPhase = useMemo(() => getMoonPhase(new Date(nowMs)), [nowMs]);

  const isExpanded = expanded ?? internalExpanded;
  const forecast = weather?.forecast;
  const hasForecast = !!forecast?.length;
  const isLoading = loading || (!weather && !error);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(([entry]) =>
      setIsCompact(entry.contentRect.width < COMPACT_CARD_MAX_WIDTH_PX),
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const toggleForecast = useCallback(() => {
    const next = !isExpanded;
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpanded, expanded, onExpandedChange]);

  const canToggle = hasForecast && !isLoading && !error;

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target.closest(INTERACTIVE_SELECTOR) ||
      target.closest(`#${CSS.escape(forecastId)}`)
    )
      return;
    toggleForecast();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleForecast();
  };

  const tiles: StatTile[] = useMemo(() => {
    if (!weather) {
      return [];
    }

    const sunTiles: StatTile[] = location
      ? getOrderedSunEvents(location, nowMs).map(event => ({
          key: event.label,
          icon: <TileIcon icon={SUN_EVENT_LUCIDE_ICON[event.label]} />,
          value: formatLocalTime(
            event.ts,
            timezoneOffsetSeconds ?? getBrowserTimezoneOffsetSeconds(),
          ),
          label: event.label,
          title: event.label,
        }))
      : [];

    const leftTiles: StatTile[] = [
      {
        key: WEATHER_TILE_TITLE,
        icon: (
          <TileIcon
            icon={weatherLucideIcon(weather.condition, weather.isDay)}
          />
        ),
        value: `${toDisplayTemperature(weather.temperatureC)}${DEGREES_CELSIUS}`,
        valueNote: (
          <span className="ml-1 text-[0.7rem] font-normal text-[var(--gray-11)]">
            (
            {isCompact
              ? `${toDisplayTemperature(weather.feelsLikeC)}°`
              : t('WEATHER.FEELS_LIKE', {
                  temperature: toDisplayTemperature(weather.feelsLikeC),
                })}
            )
          </span>
        ),
        valueDetail: (
          <span className="flex flex-col text-[0.6rem] font-normal leading-tight text-[var(--gray-11)]">
            <span>
              {t('WEATHER.HIGH', {
                temperature: toDisplayTemperature(weather.highC),
              })}
            </span>
            <span>
              {t('WEATHER.LOW', {
                temperature: toDisplayTemperature(weather.lowC),
              })}
            </span>
          </span>
        ),
        label: weather.city ?? t('LOCATION.FALLBACK'),
        title: `${WEATHER_TILE_TITLE}${TITLE_SEPARATOR}${t(
          `CONDITION.${weather.condition}`,
        )}`,
      },
      {
        key: MOON_TILE_KEY,
        icon: moonPhase.icon,
        value: formatMoonIllumination(moonPhase),
        label: moonPhase.name,
        title: `${moonPhase.name}${TITLE_SEPARATOR}${formatMoonIllumination(
          moonPhase,
        )} illuminated`,
      },
    ];

    return leftTiles.flatMap((leftTile, row) =>
      [leftTile, sunTiles[row]].filter(Boolean),
    );
  }, [
    weather,
    location,
    timezoneOffsetSeconds,
    nowMs,
    moonPhase,
    isCompact,
    t,
  ]);

  const renderTiles = () => {
    if (error) {
      return <LocalWeatherMessage failure={error} onRetry={onRetry} />;
    }
    return (
      <div
        className={TILE_GRID_CLASS}
        role={isLoading ? 'status' : undefined}
        aria-label={isLoading ? t('STATUS.LOADING_WEATHER') : undefined}
      >
        {isLoading
          ? Array.from({ length: TILE_COUNT }, (_, index) => (
              <SkeletonTileView key={index} />
            ))
          : tiles.map(tile => <StatTileView key={tile.key} tile={tile} />)}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={cn(CARD_CLASS, canToggle && CARD_TOGGLE_CLASS, className)}
      {...(canToggle && {
        role: 'button',
        tabIndex: 0,
        title: t('FORECAST.LABEL'),
        'aria-expanded': isExpanded,
        'aria-controls': isExpanded ? forecastId : undefined,
        onClick: handleCardClick,
        onKeyDown: handleCardKeyDown,
      })}
    >
      <div className={SUMMARY_CLASS}>
        <div className={HERO_CLASS}>
          <ClockComponent type="time" timeSize={CLOCK_TIME_SIZE} />
          <ClockComponent type="info" />
        </div>
        {renderTiles()}
      </div>

      {!error && (
        <WeatherDetails
          weather={isLoading || !weather ? PLACEHOLDER_WEATHER : weather}
          loading={isLoading}
          preparationLoading={preparationLoading}
        />
      )}

      {isExpanded && hasForecast && forecast && (
        <ForecastCarousel id={forecastId} forecast={forecast} />
      )}

      {!error && (
        <footer
          className={cn(ATTRIBUTION_CLASS, isLoading && INVISIBLE_CLASS)}
          aria-hidden={isLoading || undefined}
        >
          {t('ATTRIBUTION.WEATHER')} <span aria-hidden>{SEPARATOR}</span>{' '}
          {t('ATTRIBUTION.LOCATION')}
        </footer>
      )}
    </div>
  );
};

const SelfLocatingWeatherClockCard = ({
  fetchWeather,
  fetchPreparation,
  location,
  ...viewProps
}: WeatherClockCardProps & {
  fetchWeather: NonNullable<WeatherClockCardProps['fetchWeather']>;
}) => {
  const { state, preparation, retry } = useLocalWeather({
    fetchWeather,
    fetchPreparation,
  });
  const ready = state.status === LOCAL_WEATHER_STATUS.READY ? state : null;
  const failure = FAILURE_STATUSES.includes(state.status)
    ? (state.status as LocalWeatherFailure)
    : undefined;

  return (
    <WeatherClockCardView
      {...viewProps}
      location={ready?.location ?? location}
      weather={ready ? { ...ready.weather, preparation } : undefined}
      error={failure}
      onRetry={retry}
      preparationLoading={
        !!ready && !!fetchPreparation && preparation === undefined
      }
    />
  );
};

export const WeatherClockCardUtilityContent = ({
  fetchWeather,
  ...props
}: WeatherClockCardProps) => (
  <WeatherI18nProvider>
    {fetchWeather ? (
      <SelfLocatingWeatherClockCard fetchWeather={fetchWeather} {...props} />
    ) : (
      <WeatherClockCardView {...props} />
    )}
  </WeatherI18nProvider>
);
