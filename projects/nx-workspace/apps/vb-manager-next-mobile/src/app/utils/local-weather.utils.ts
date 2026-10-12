import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LocalWeather,
  Location,
  Preparation,
  toLocalWeather,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../providers/auth-provider';

const WEATHER_API = '/api/weather';
const WEATHER_CITY_API = '/api/weather/city';
const PREPARATION_API = '/api/preparation';

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
  return toLocalWeather(weather, city);
};

export const fetchLocalPreparation = async (
  weather: LocalWeather,
): Promise<Preparation | null> => {
  const response = await authFetch(PREPARATION_API, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify(weather),
  });
  return response.ok ? ((await response.json()) as Preparation) : null;
};
