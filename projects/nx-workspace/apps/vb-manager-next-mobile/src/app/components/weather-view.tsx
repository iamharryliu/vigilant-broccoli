'use client';

import { LocalWeatherPanel } from '@vigilant-broccoli/react-lib';
import {
  fetchLocalPreparation,
  fetchLocalWeather,
} from '../utils/local-weather.utils';

export const WeatherView = () => (
  <LocalWeatherPanel
    fetchWeather={fetchLocalWeather}
    fetchPreparation={fetchLocalPreparation}
  />
);
