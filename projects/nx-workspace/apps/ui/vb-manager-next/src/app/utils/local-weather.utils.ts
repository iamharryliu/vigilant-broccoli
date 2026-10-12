import {
  HTTP_HEADERS,
  HTTP_METHOD,
  Location,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { LocalWeather, Preparation } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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
  const response = await authFetch(`${API_ENDPOINTS.WEATHER_CITY}?${params}`);
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
    authFetch(`${API_ENDPOINTS.WEATHER}?${params}`),
    fetchCity(params).catch(() => null),
  ]);
  if (!response.ok) return null;
  const { weather }: { weather: WeatherSnapshot } = await response.json();
  return weather.daily[TODAY_INDEX] ? toLocalWeather(weather, city) : null;
};

export const fetchLocalPreparation = async (
  weather: LocalWeather,
): Promise<Preparation | null> => {
  const response = await authFetch(API_ENDPOINTS.PREPARATION, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify(weather),
  });
  return response.ok ? ((await response.json()) as Preparation) : null;
};
