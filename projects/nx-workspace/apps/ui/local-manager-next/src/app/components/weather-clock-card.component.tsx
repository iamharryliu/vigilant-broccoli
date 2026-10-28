'use client';

import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import {
  fetchLocalPreparation,
  fetchLocalWeather,
} from '../utils/local-weather.utils';

export const WeatherClockCard = () => (
  <WeatherClockCardUtilityContent
    fetchWeather={fetchLocalWeather}
    fetchPreparation={fetchLocalPreparation}
  />
);
