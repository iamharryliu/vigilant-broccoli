import { Location, WeatherSnapshot } from '@vigilant-broccoli/common-js';
import { LocalWeather } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../providers/auth-provider';

const WEATHER_API = '/api/weather';
const WEATHER_CITY_API = '/api/weather/city';
const TODAY_INDEX = 0;

const toLocalWeather = (
  { current, daily }: WeatherSnapshot,
  city: string | null,
): LocalWeather => {
  const today = daily[TODAY_INDEX];
  return {
    city,
    temperatureC: current.temperatureC,
    feelsLikeC: current.feelsLikeC,
    highC: today.tempMaxC,
    lowC: today.tempMinC,
    humidityPercent: current.humidityPercent,
    windSpeedKph: current.windSpeedKph,
    windMaxKph: today.windMaxKph,
    precipitationMm: current.precipitationMm,
    precipitationSumMm: today.precipitationSumMm,
    condition: current.condition,
    isDay: current.isDay,
  };
};

const fetchCity = async (params: URLSearchParams): Promise<string | null> => {
  const response = await authFetch(`${WEATHER_CITY_API}?${params}`);
  if (!response.ok) return null;
  const { city }: { city: string | null } = await response.json();
  return city;
};

export const fetchLocalWeather = async ({
  latitude,
  longitude,
}: Location): Promise<LocalWeather | null> => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  const [response, city] = await Promise.all([
    authFetch(`${WEATHER_API}?${params}`),
    fetchCity(params).catch(() => null),
  ]);
  if (!response.ok) return null;
  const { weather }: { weather: WeatherSnapshot } = await response.json();
  return weather.daily[TODAY_INDEX] ? toLocalWeather(weather, city) : null;
};
