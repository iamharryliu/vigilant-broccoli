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
  SUN_EVENT,
  SunEventKind,
  WEATHER_CONDITION,
  WeatherCondition,
} from '@vigilant-broccoli/common-js';

const WEATHER_ICON_TIME = { DAY: 'day', NIGHT: 'night' } as const;

interface DayNightIcon {
  day: LucideIcon;
  night: LucideIcon;
}

const WEATHER_LUCIDE_ICON: Record<WeatherCondition, DayNightIcon> = {
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

export const weatherLucideIcon = (
  condition: WeatherCondition,
  isDay: boolean,
): LucideIcon =>
  WEATHER_LUCIDE_ICON[condition][
    isDay ? WEATHER_ICON_TIME.DAY : WEATHER_ICON_TIME.NIGHT
  ];

export const SUN_EVENT_LUCIDE_ICON: Record<SunEventKind, LucideIcon> = {
  [SUN_EVENT.SUNRISE]: Sunrise,
  [SUN_EVENT.SUNSET]: Sunset,
};
