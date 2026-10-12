'use client';

import { useState } from 'react';
import { DashboardInfoCardUtilityContent } from '@vigilant-broccoli/react-utility';
import { LocalWeatherDialog } from '@vigilant-broccoli/react-lib';
import { fetchLocalWeather } from '../utils/local-weather.utils';
import { useWeather } from '../hooks/useWeather';

const FALLBACK_LOCATION = { latitude: 0, longitude: 0 };

export const DashboardInfoCard = () => {
  const { weatherData, loading: weatherLoading } = useWeather();
  const [weatherDialogOpen, setWeatherDialogOpen] = useState(false);
  const weather = weatherData[0];

  return (
    <>
      <DashboardInfoCardUtilityContent
        location={weather?.location ?? FALLBACK_LOCATION}
        timezoneOffsetSeconds={weather?.timezone ?? 0}
        weather={
          weather && {
            city: weather.city,
            temp: weather.now.temp,
            condition: weather.now.condition,
            isDay: weather.now.isDay,
          }
        }
        loading={weatherLoading}
        onWeatherClick={() => setWeatherDialogOpen(true)}
      />
      <LocalWeatherDialog
        fetchWeather={fetchLocalWeather}
        open={weatherDialogOpen}
        onOpenChange={setWeatherDialogOpen}
      />
    </>
  );
};
