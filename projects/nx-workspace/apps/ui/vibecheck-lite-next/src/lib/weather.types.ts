import { WeatherCondition } from '@vigilant-broccoli/common-js';

export interface LocalWeather {
  city: string | null;
  temperatureC: number;
  feelsLikeC: number;
  highC: number;
  lowC: number;
  condition: WeatherCondition;
  isDay: boolean;
}
