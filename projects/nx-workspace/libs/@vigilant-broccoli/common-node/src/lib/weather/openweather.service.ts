import 'dotenv-defaults/config';
import { Location } from '@vigilant-broccoli/common-js';
import { logger } from '../logging/logger.service';
import { getEnvironmentVariable } from '../utils';

export interface OpenWeatherForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface WeatherForecastData {
  weatherData: OpenWeatherForecastItem[];
  timezoneOffset: number;
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';


export const OpenWeatherService = {
  /**
   * Get weather forecast for a location
   * @param location - Location with latitude and longitude
   * @param count - Number of forecast items to return (default: 4)
   * @param units - Units for temperature (standard, metric, imperial)
   * @returns Weather forecast data with timezone offset
   */
  async getForecast(
    location: Location,
    count = 4,
    units: 'standard' | 'metric' | 'imperial' = 'standard',
  ): Promise<WeatherForecastData> {
    try {
      const apiKey = getEnvironmentVariable('OPENWEATHER_API_KEY');
      const url = `${BASE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&units=${units}&appid=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenWeatherForecastResponse = await response.json();
      const weatherData = data.list.slice(0, count);
      const timezoneOffset = data.city.timezone;

      return { weatherData, timezoneOffset };
    } catch (err) {
      logger.error('Failed to fetch weather forecast', err);
      throw err;
    }
  },

  /**
   * Get current weather for a location
   * @param location - Location with latitude and longitude
   * @param units - Units for temperature (standard, metric, imperial)
   * @returns Current weather data
   */
  async getCurrentWeather(
    location: Location,
    units: 'standard' | 'metric' | 'imperial' = 'standard',
  ): Promise<unknown> {
    try {
      const apiKey = getEnvironmentVariable('OPENWEATHER_API_KEY');
      const url = `${BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&units=${units}&appid=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      logger.error('Failed to fetch current weather', err);
      throw err;
    }
  },
};
