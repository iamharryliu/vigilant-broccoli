import {
  LocalWeather,
  Location,
  OPEN_METEO_MAX_FORECAST_DAYS,
  toLocalWeather,
  WEATHER_PROVIDER,
} from '@vigilant-broccoli/common-js';
import { reverseGeocodeCity } from './geocode.service';
import { WeatherService } from './weather.service';

const HOURLY_COUNT = 0;

/**
 * Open-Meteo weather with every forecast day plus the Nominatim city, or
 * `null` when the weather is unavailable. A missing city only degrades the
 * label, so it must not fail the weather fetched alongside it.
 */
export const getLocalWeather = async (
  location: Location,
  userAgent: string,
): Promise<LocalWeather | null> => {
  const [weather, city] = await Promise.all([
    WeatherService.getWeather(location, {
      provider: WEATHER_PROVIDER.OPEN_METEO,
      hourlyCount: HOURLY_COUNT,
      dailyCount: OPEN_METEO_MAX_FORECAST_DAYS,
    }).catch(() => null),
    reverseGeocodeCity(location, userAgent),
  ]);
  return weather && toLocalWeather(weather, city);
};
