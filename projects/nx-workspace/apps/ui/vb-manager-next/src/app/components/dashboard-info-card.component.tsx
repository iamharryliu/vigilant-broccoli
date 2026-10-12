'use client';

import { DashboardInfoCardUtilityContent } from '@vigilant-broccoli/react-utility';
import {
  fetchLocalPreparation,
  fetchLocalWeather,
} from '../utils/local-weather.utils';

export const DashboardInfoCard = () => (
  <DashboardInfoCardUtilityContent
    fetchWeather={fetchLocalWeather}
    fetchPreparation={fetchLocalPreparation}
  />
);
