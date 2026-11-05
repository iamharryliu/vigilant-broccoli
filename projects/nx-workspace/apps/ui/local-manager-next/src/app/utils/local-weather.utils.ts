import {
  LocalWeather,
  Location,
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
