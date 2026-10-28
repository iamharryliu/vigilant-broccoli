'use client';

import { LocalWeather, Location } from '@vigilant-broccoli/common-js';
import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import { QUERY_PARAM, WEATHER_API_PATH } from '../../lib/weather.consts';

const fetchWeather = ({ latitude, longitude }: Location) =>
  fetch(
    `${WEATHER_API_PATH}?${new URLSearchParams({
      [QUERY_PARAM.LAT]: String(latitude),
      [QUERY_PARAM.LON]: String(longitude),
    })}`,
  ).then(response =>
    response.ok ? (response.json() as Promise<LocalWeather>) : null,
  );

export function WeatherApp() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4 py-12 text-gray-900 dark:from-slate-900 dark:to-slate-950 dark:text-gray-100">
      <div className="w-full max-w-xl">
        <WeatherClockCardUtilityContent fetchWeather={fetchWeather} />
      </div>
    </main>
  );
}
