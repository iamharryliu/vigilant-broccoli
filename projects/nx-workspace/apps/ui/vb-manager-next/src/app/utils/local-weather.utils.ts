import { Location, WeatherSnapshot } from '@vigilant-broccoli/common-js';
import { LocalWeather } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const TODAY_INDEX = 0;

const toLocalWeather = ({ current, daily }: WeatherSnapshot): LocalWeather => {
  const today = daily[TODAY_INDEX];
  return {
    city: null,
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

export const fetchLocalWeather = async ({
  latitude,
  longitude,
}: Location): Promise<LocalWeather | null> => {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  const response = await authFetch(`${API_ENDPOINTS.WEATHER}?${params}`);
  if (!response.ok) return null;
  const { weather }: { weather: WeatherSnapshot } = await response.json();
  return weather.daily[TODAY_INDEX] ? toLocalWeather(weather) : null;
};
