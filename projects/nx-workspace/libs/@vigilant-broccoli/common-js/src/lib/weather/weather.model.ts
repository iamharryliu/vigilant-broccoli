import { Location } from '../location/location.model';

export const WEATHER_PROVIDER = {
  OPEN_METEO: 'open-meteo',
  OPENWEATHER: 'openweather',
} as const;

export type WeatherProvider =
  (typeof WEATHER_PROVIDER)[keyof typeof WEATHER_PROVIDER];

export const WEATHER_PROVIDERS = Object.values(
  WEATHER_PROVIDER,
) as WeatherProvider[];

export const DEFAULT_WEATHER_PROVIDER = WEATHER_PROVIDER.OPEN_METEO;

export const isWeatherProvider = (value: unknown): value is WeatherProvider =>
  WEATHER_PROVIDERS.includes(value as WeatherProvider);

/**
 * Provider-neutral conditions. Both OpenWeather condition ids and Open-Meteo
 * WMO codes collapse into these, so consumers never key off a provider's own
 * vocabulary.
 */
export const WEATHER_CONDITION = {
  CLEAR: 'CLEAR',
  PARTLY_CLOUDY: 'PARTLY_CLOUDY',
  CLOUDY: 'CLOUDY',
  FOG: 'FOG',
  DRIZZLE: 'DRIZZLE',
  RAIN: 'RAIN',
  SNOW: 'SNOW',
  THUNDERSTORM: 'THUNDERSTORM',
} as const;

export type WeatherCondition =
  (typeof WEATHER_CONDITION)[keyof typeof WEATHER_CONDITION];

export const WEATHER_CONDITIONS = Object.values(
  WEATHER_CONDITION,
) as WeatherCondition[];

export interface WeatherConditionIcon {
  day: string;
  night: string;
}

export const WEATHER_CONDITION_ICON: Record<
  WeatherCondition,
  WeatherConditionIcon
> = {
  [WEATHER_CONDITION.CLEAR]: { day: '☀️', night: '🌙' },
  [WEATHER_CONDITION.PARTLY_CLOUDY]: { day: '🌤️', night: '☁️' },
  [WEATHER_CONDITION.CLOUDY]: { day: '☁️', night: '☁️' },
  [WEATHER_CONDITION.FOG]: { day: '🌫️', night: '🌫️' },
  [WEATHER_CONDITION.DRIZZLE]: { day: '🌦️', night: '🌧️' },
  [WEATHER_CONDITION.RAIN]: { day: '🌧️', night: '🌧️' },
  [WEATHER_CONDITION.SNOW]: { day: '❄️', night: '❄️' },
  [WEATHER_CONDITION.THUNDERSTORM]: { day: '⛈️', night: '⛈️' },
};

export const WEATHER_CONDITION_LABEL: Record<WeatherCondition, string> = {
  [WEATHER_CONDITION.CLEAR]: 'clear',
  [WEATHER_CONDITION.PARTLY_CLOUDY]: 'partly cloudy',
  [WEATHER_CONDITION.CLOUDY]: 'cloudy',
  [WEATHER_CONDITION.FOG]: 'fog',
  [WEATHER_CONDITION.DRIZZLE]: 'drizzle',
  [WEATHER_CONDITION.RAIN]: 'rain',
  [WEATHER_CONDITION.SNOW]: 'snow',
  [WEATHER_CONDITION.THUNDERSTORM]: 'thunderstorm',
};

export const getWeatherIcon = (
  condition: WeatherCondition,
  isDay = true,
): string => {
  const icon = WEATHER_CONDITION_ICON[condition];
  if (!icon) {
    return WEATHER_CONDITION_ICON[WEATHER_CONDITION.CLOUDY].day;
  }
  return isDay ? icon.day : icon.night;
};

export interface CurrentWeather {
  temperatureC: number;
  feelsLikeC: number;
  condition: WeatherCondition;
  isDay: boolean;
}

export interface HourlyWeather {
  timestampMs: number;
  temperatureC: number;
  condition: WeatherCondition;
  isDay: boolean;
}

export interface DailyWeather {
  date: string;
  tempMinC: number;
  tempMaxC: number;
  condition: WeatherCondition;
}

export interface WeatherSnapshot {
  provider: WeatherProvider;
  location: Location;
  timezoneOffsetSeconds: number;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface WeatherRequestOptions {
  provider?: WeatherProvider;
  hourlyCount?: number;
  dailyCount?: number;
}
