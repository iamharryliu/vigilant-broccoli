'use client';

import { LocalWeather, Location } from '@vigilant-broccoli/common-js';
import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import { WEATHER_QUERY_PARAM } from '../app.const';
import { authFetch } from '../providers/auth-provider';

const WEATHER_API = '/api/weather';

const fetchWeather = ({ latitude, longitude }: Location) =>
  authFetch(
    `${WEATHER_API}?${new URLSearchParams({
      [WEATHER_QUERY_PARAM.LAT]: String(latitude),
      [WEATHER_QUERY_PARAM.LON]: String(longitude),
    })}`,
  ).then(response =>
    response.ok ? (response.json() as Promise<LocalWeather>) : null,
  );

export const WeatherView = () => (
  <div className="mx-auto w-full max-w-xl">
    <WeatherClockCardUtilityContent fetchWeather={fetchWeather} />
  </div>
);
