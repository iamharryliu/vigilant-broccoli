import {
  DEFAULT_WEATHER_PROVIDER,
  isWeatherProvider,
  Location,
  WEATHER_PROVIDER,
  WeatherProvider,
  WeatherRequestOptions,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '../utils';
import { logger } from '../logging/logger.service';
import { fetchOpenMeteoSnapshot } from './open-meteo.provider';
import { fetchOpenWeatherSnapshot } from './openweather.provider';
import {
  DEFAULT_DAILY_COUNT,
  DEFAULT_HOURLY_COUNT,
  WEATHER_PROVIDER_ENV_VAR,
} from './weather.consts';

type SnapshotFetcher = (
  location: Location,
  hourlyCount: number,
  dailyCount: number,
) => Promise<WeatherSnapshot>;

const PROVIDER_FETCHERS: Record<WeatherProvider, SnapshotFetcher> = {
  [WEATHER_PROVIDER.OPEN_METEO]: fetchOpenMeteoSnapshot,
  [WEATHER_PROVIDER.OPENWEATHER]: fetchOpenWeatherSnapshot,
};

/**
 * Explicit option wins, then the WEATHER_PROVIDER env var, then the default.
 */
const resolveWeatherProvider = (
  provider?: WeatherProvider,
): WeatherProvider => {
  if (provider) {
    return provider;
  }
  const fromEnv = getEnvironmentVariable(WEATHER_PROVIDER_ENV_VAR);
  return isWeatherProvider(fromEnv) ? fromEnv : DEFAULT_WEATHER_PROVIDER;
};

const getWeather = async (
  location: Location,
  options: WeatherRequestOptions = {},
): Promise<WeatherSnapshot> => {
  const provider = resolveWeatherProvider(options.provider);
  const {
    hourlyCount = DEFAULT_HOURLY_COUNT,
    dailyCount = DEFAULT_DAILY_COUNT,
  } = options;

  try {
    return await PROVIDER_FETCHERS[provider](location, hourlyCount, dailyCount);
  } catch (err) {
    logger.error(`Failed to fetch weather from ${provider}`, err);
    throw err;
  }
};

export const WeatherService = {
  getWeather,
  resolveWeatherProvider,
};
