import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LocalWeather,
  Location,
  Preparation,
  toLocalWeather,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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
  return toLocalWeather(weather, city);
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
