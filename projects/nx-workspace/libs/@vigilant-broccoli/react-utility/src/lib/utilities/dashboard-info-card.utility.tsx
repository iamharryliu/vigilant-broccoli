'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  LucideIcon,
  Moon,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import {
  formatLocalTime,
  formatMoonIllumination,
  getMoonPhase,
  getOrderedSunEvents,
  Location,
  SUN_EVENT,
  SunEventKind,
  WEATHER_CONDITION,
  WeatherCondition,
} from '@vigilant-broccoli/common-js';
import { Skeleton, TextProps } from '@vigilant-broccoli/react-lib';
import { ClockComponent } from '../clock';

const CLOCK_TIME_SIZE: TextProps['size'] = '6';

const TICK_MS = 60 * 1000;

const TILE_MIN_WIDTH = '6.5rem';
const TILE_ICON_SIZE = 22;
const TILE_ICON_STROKE = 1.75;
const TILE_COUNT = 4;
const DEGREES_CELSIUS = '°C';
const WEATHER_TILE_TITLE = 'Weather';
const WEATHER_ICON_TIME = { DAY: 'day', NIGHT: 'night' } as const;
const MOON_TILE_KEY = 'Moon';

export interface DashboardInfoCardWeather {
  city: string;
  temp: number;
  condition: WeatherCondition;
  isDay: boolean;
}

export interface DashboardInfoCardProps {
  location: Location;
  timezoneOffsetSeconds: number;
  weather?: DashboardInfoCardWeather;
  loading?: boolean;
  onWeatherClick?: () => void;
}

interface WeatherLucideIcon {
  day: LucideIcon;
  night: LucideIcon;
}

const WEATHER_LUCIDE_ICON: Record<WeatherCondition, WeatherLucideIcon> = {
  [WEATHER_CONDITION.CLEAR]: { day: Sun, night: Moon },
  [WEATHER_CONDITION.PARTLY_CLOUDY]: { day: CloudSun, night: CloudMoon },
  [WEATHER_CONDITION.CLOUDY]: { day: Cloud, night: Cloud },
  [WEATHER_CONDITION.FOG]: { day: CloudFog, night: CloudFog },
  [WEATHER_CONDITION.DRIZZLE]: { day: CloudDrizzle, night: CloudDrizzle },
  [WEATHER_CONDITION.RAIN]: { day: CloudRain, night: CloudRain },
  [WEATHER_CONDITION.SNOW]: { day: CloudSnow, night: CloudSnow },
  [WEATHER_CONDITION.THUNDERSTORM]: {
    day: CloudLightning,
    night: CloudLightning,
  },
};

const weatherLucideIcon = ({
  condition,
  isDay,
}: DashboardInfoCardWeather): LucideIcon =>
  WEATHER_LUCIDE_ICON[condition][
    isDay ? WEATHER_ICON_TIME.DAY : WEATHER_ICON_TIME.NIGHT
  ];

const SUN_EVENT_LUCIDE_ICON: Record<SunEventKind, LucideIcon> = {
  [SUN_EVENT.SUNRISE]: Sunrise,
  [SUN_EVENT.SUNSET]: Sunset,
};

const TileIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <Icon size={TILE_ICON_SIZE} strokeWidth={TILE_ICON_STROKE} />
);

interface StatTile {
  key: string;
  icon: ReactNode;
  value: string;
  label: string;
  title: string;
  onClick?: () => void;
}

const CARD_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '1.5rem',
  rowGap: '1rem',
  padding: '1rem',
  backgroundColor:
    'color-mix(in srgb, var(--color-background) 50%, transparent)',
  borderRadius: '0.75rem',
  border: '1px solid var(--gray-6)',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
} as const;

const HERO_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.35rem',
  minWidth: 'max-content',
} as const;

const TILE_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: `repeat(2, minmax(${TILE_MIN_WIDTH}, 1fr))`,
  columnGap: '1.25rem',
  rowGap: '0.75rem',
  paddingLeft: '1.5rem',
  borderLeft: '1px solid var(--gray-6)',
} as const;

const TILE_ICON_STYLE = {
  fontSize: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  color: 'var(--gray-11)',
} as const;

const TILE_TEXT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
} as const;

const TILE_VALUE_STYLE = { fontSize: '0.85rem', fontWeight: 600 } as const;

const TILE_LABEL_STYLE = {
  fontSize: '0.7rem',
  color: 'var(--gray-9)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const tileStyle = (interactive: boolean) =>
  ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: TILE_MIN_WIDTH,
    cursor: interactive ? 'pointer' : 'default',
    transition: 'opacity 0.2s ease',
  }) as const;

const StatTileView = ({ tile }: { tile: StatTile }) => (
  <div
    onClick={tile.onClick}
    title={tile.title}
    style={tileStyle(Boolean(tile.onClick))}
    onMouseEnter={e => {
      if (tile.onClick) e.currentTarget.style.opacity = '0.7';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.opacity = '1';
    }}
  >
    <span style={TILE_ICON_STYLE}>{tile.icon}</span>
    <div style={TILE_TEXT_STYLE}>
      <span style={TILE_VALUE_STYLE}>{tile.value}</span>
      <span style={TILE_LABEL_STYLE}>{tile.label}</span>
    </div>
  </div>
);

const SkeletonTileView = () => (
  <div style={tileStyle(false)}>
    <Skeleton className="h-6 w-6 rounded-full" />
    <div style={{ ...TILE_TEXT_STYLE, gap: '0.25rem', flex: 1 }}>
      <Skeleton className="h-3.5 w-10" />
      <Skeleton className="h-2.5 w-14" />
    </div>
  </div>
);

export const DashboardInfoCardUtilityContent = ({
  location,
  timezoneOffsetSeconds,
  weather,
  loading = false,
  onWeatherClick,
}: DashboardInfoCardProps) => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const moonPhase = useMemo(() => getMoonPhase(new Date(nowMs)), [nowMs]);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const tiles: StatTile[] = useMemo(() => {
    if (!weather) {
      return [];
    }

    const sunTiles: StatTile[] = getOrderedSunEvents(location, nowMs).map(
      event => ({
        key: event.label,
        icon: <TileIcon icon={SUN_EVENT_LUCIDE_ICON[event.label]} />,
        value: formatLocalTime(event.ts, timezoneOffsetSeconds),
        label: event.label,
        title: event.label,
      }),
    );

    const leftTiles: StatTile[] = [
      {
        key: WEATHER_TILE_TITLE,
        icon: <TileIcon icon={weatherLucideIcon(weather)} />,
        value: `${weather.temp}${DEGREES_CELSIUS}`,
        label: weather.city,
        title: WEATHER_TILE_TITLE,
        onClick: onWeatherClick,
      },
      {
        key: MOON_TILE_KEY,
        icon: moonPhase.icon,
        value: formatMoonIllumination(moonPhase),
        label: moonPhase.name,
        title: `${moonPhase.name} — ${formatMoonIllumination(
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
    onWeatherClick,
  ]);

  return (
    <div style={CARD_STYLE}>
      <div style={HERO_STYLE}>
        <ClockComponent type="time" timeSize={CLOCK_TIME_SIZE} />
        <ClockComponent type="info" />
      </div>

      <div style={TILE_GRID_STYLE}>
        {loading || !weather
          ? Array.from({ length: TILE_COUNT }, (_, index) => (
              <SkeletonTileView key={index} />
            ))
          : tiles.map(tile => <StatTileView key={tile.key} tile={tile} />)}
      </div>
    </div>
  );
};
