import {
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
  Location,
  WEATHER_CONDITION,
  WEATHER_PROVIDER,
  WeatherCondition,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '../utils';
import {
  ISO_DATE_LENGTH,
  MS_PER_SECOND,
  OPENWEATHER_API_KEY_ENV_VAR,
  OPENWEATHER_BASE_URL,
} from './weather.consts';

interface OpenWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface OpenWeatherCurrentResponse {
  dt: number;
  main: { temp: number; feels_like: number };
  weather: OpenWeatherCondition[];
  timezone: number;
  sys: { sunrise: number; sunset: number };
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: { temp: number };
    weather: OpenWeatherCondition[];
  }>;
  city: { timezone: number };
}

const METRIC_UNITS = 'metric';
const DAY_ICON_SUFFIX = 'd';
const CURRENT_WEATHER_PATH = 'weather';
const FORECAST_PATH = 'forecast';

/**
 * OpenWeather condition ids are grouped by their leading digit, except the
 * 8xx block which splits clear/clouds — see openweathermap.org/weather-conditions.
 */
const CONDITION_ID_CLEAR = 800;
const CONDITION_ID_PARTLY_CLOUDY_MAX = 802;

const CONDITION_GROUP_MAP: Array<{
  matches: (id: number) => boolean;
  condition: WeatherCondition;
}> = [
  {
    matches: id => id >= 200 && id < 300,
    condition: WEATHER_CONDITION.THUNDERSTORM,
  },
  {
    matches: id => id >= 300 && id < 400,
    condition: WEATHER_CONDITION.DRIZZLE,
  },
  { matches: id => id >= 500 && id < 600, condition: WEATHER_CONDITION.RAIN },
  { matches: id => id >= 600 && id < 700, condition: WEATHER_CONDITION.SNOW },
  { matches: id => id >= 700 && id < 800, condition: WEATHER_CONDITION.FOG },
  {
    matches: id => id === CONDITION_ID_CLEAR,
    condition: WEATHER_CONDITION.CLEAR,
  },
  {
    matches: id =>
      id > CONDITION_ID_CLEAR && id <= CONDITION_ID_PARTLY_CLOUDY_MAX,
    condition: WEATHER_CONDITION.PARTLY_CLOUDY,
  },
];

const toConditionFromOpenWeatherId = (id: number): WeatherCondition =>
  CONDITION_GROUP_MAP.find(group => group.matches(id))?.condition ??
  WEATHER_CONDITION.CLOUDY;

const isDayIcon = (icon: string): boolean => icon.endsWith(DAY_ICON_SUFFIX);

const buildUrl = (path: string, location: Location, apiKey: string): string => {
  const params = new URLSearchParams({
    lat: String(location.latitude),
    lon: String(location.longitude),
    units: METRIC_UNITS,
    appid: apiKey,
  });
  return `${OPENWEATHER_BASE_URL}/${path}?${params}`;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `OpenWeather API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
};

const toCurrent = (data: OpenWeatherCurrentResponse): CurrentWeather => ({
  temperatureC: data.main.temp,
  feelsLikeC: data.main.feels_like,
  condition: toConditionFromOpenWeatherId(data.weather[0].id),
  isDay: isDayIcon(data.weather[0].icon),
});

const toHourly = (
  data: OpenWeatherForecastResponse,
  hourlyCount: number,
): HourlyWeather[] => {
  const nowMs = Date.now();
  return data.list
    .map(item => ({
      timestampMs: item.dt * MS_PER_SECOND,
      temperatureC: item.main.temp,
      condition: toConditionFromOpenWeatherId(item.weather[0].id),
      isDay: isDayIcon(item.weather[0].icon),
    }))
    .filter(entry => entry.timestampMs >= nowMs)
    .slice(0, hourlyCount);
};

/**
 * The free tier has no daily endpoint, so days are folded out of the 3-hour
 * list. The condition is taken from the midday-most slot rather than the first,
 * which would otherwise report every day by its small hours.
 */
const toDaily = (
  data: OpenWeatherForecastResponse,
  dailyCount: number,
): DailyWeather[] => {
  const offsetMs = data.city.timezone * MS_PER_SECOND;
  const buckets = new Map<
    string,
    { temps: number[]; conditions: WeatherCondition[] }
  >();

  data.list.forEach(item => {
    const localDate = new Date(item.dt * MS_PER_SECOND + offsetMs)
      .toISOString()
      .slice(0, ISO_DATE_LENGTH);
    const bucket = buckets.get(localDate) ?? { temps: [], conditions: [] };
    bucket.temps.push(item.main.temp);
    bucket.conditions.push(toConditionFromOpenWeatherId(item.weather[0].id));
    buckets.set(localDate, bucket);
  });

  return Array.from(buckets.entries())
    .slice(0, dailyCount)
    .map(([date, { temps, conditions }]) => ({
      date,
      tempMinC: Math.min(...temps),
      tempMaxC: Math.max(...temps),
      condition: conditions[Math.floor(conditions.length / 2)],
    }));
};

export const fetchOpenWeatherSnapshot = async (
  location: Location,
  hourlyCount: number,
  dailyCount: number,
): Promise<WeatherSnapshot> => {
  const apiKey = getEnvironmentVariable(OPENWEATHER_API_KEY_ENV_VAR);

  if (!apiKey) {
    throw new Error(
      `OpenWeather provider requires ${OPENWEATHER_API_KEY_ENV_VAR}.`,
    );
  }

  const [current, forecast] = await Promise.all([
    fetchJson<OpenWeatherCurrentResponse>(
      buildUrl(CURRENT_WEATHER_PATH, location, apiKey),
    ),
    fetchJson<OpenWeatherForecastResponse>(
      buildUrl(FORECAST_PATH, location, apiKey),
    ),
  ]);

  return {
    provider: WEATHER_PROVIDER.OPENWEATHER,
    location,
    timezoneOffsetSeconds: current.timezone,
    current: toCurrent(current),
    hourly: toHourly(forecast, hourlyCount),
    daily: toDaily(forecast, dailyCount),
  };
};
