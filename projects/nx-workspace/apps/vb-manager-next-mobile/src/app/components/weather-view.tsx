'use client';

import { LocalWeatherPanel } from '@vigilant-broccoli/react-lib';
import { fetchLocalWeather } from '../utils/local-weather.utils';

export const WeatherView = () => (
  <LocalWeatherPanel fetchWeather={fetchLocalWeather} />
);
