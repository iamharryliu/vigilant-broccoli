import { WeatherCondition } from '@vigilant-broccoli/common-js';

export interface LocalWeather {
  city: string | null;
  temperatureC: number;
  feelsLikeC: number;
  highC: number;
  lowC: number;
  humidityPercent: number;
  windSpeedKph: number;
  windMaxKph: number;
  precipitationMm: number;
  precipitationSumMm: number;
  condition: WeatherCondition;
  isDay: boolean;
}

export interface Preparation {
  windResistantClothing: boolean;
  rainResistantClothing: boolean;
  snowResistantClothing: boolean;
  sunglasses: boolean;
}
