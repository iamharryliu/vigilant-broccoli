import { WeatherCondition, WeatherSnapshot } from './weather.model';

const TODAY_INDEX = 0;

export interface ForecastDay {
  date: string;
  highC: number;
  lowC: number;
  condition: WeatherCondition;
  precipitationSumMm: number;
}

export interface LocalWeather {
  city: string | null;
  temperatureC: number;
  feelsLikeC: number;
  highC: number;
  lowC: number;
  humidityPercent: number;
  windSpeedKph: number;
  windMaxKph: number;
  windGustKph: number;
  windGustMaxKph: number;
  precipitationMm: number;
  precipitationSumMm: number;
  snowfallCm: number;
  snowfallSumCm: number;
  condition: WeatherCondition;
  isDay: boolean;
  forecast?: ForecastDay[];
}

export interface Preparation {
  windResistantClothing: boolean;
  rainResistantClothing: boolean;
  snowResistantClothing: boolean;
  sunglasses: boolean;
}

export const toLocalWeather = (
  { current, daily }: WeatherSnapshot,
  city: string | null,
): LocalWeather | null => {
  const today = daily[TODAY_INDEX];
  if (!today) return null;
  return {
    city,
    temperatureC: current.temperatureC,
    feelsLikeC: current.feelsLikeC,
    highC: today.tempMaxC,
    lowC: today.tempMinC,
    humidityPercent: current.humidityPercent,
    windSpeedKph: current.windSpeedKph,
    windMaxKph: today.windMaxKph,
    windGustKph: current.windGustKph,
    windGustMaxKph: today.windGustMaxKph,
    precipitationMm: current.precipitationMm,
    precipitationSumMm: today.precipitationSumMm,
    snowfallCm: current.snowfallCm,
    snowfallSumCm: today.snowfallSumCm,
    condition: current.condition,
    isDay: current.isDay,
    forecast: daily.map(day => ({
      date: day.date,
      highC: day.tempMaxC,
      lowC: day.tempMinC,
      condition: day.condition,
      precipitationSumMm: day.precipitationSumMm,
    })),
  };
};
