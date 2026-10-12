'use client';

import {
  HTTP_HEADERS,
  HTTP_METHOD,
  LocalWeather,
  Location,
  Preparation,
} from '@vigilant-broccoli/common-js';
import { DashboardInfoCardUtilityContent } from '@vigilant-broccoli/react-utility';
import {
  PREPARATION_API_PATH,
  QUERY_PARAM,
  WEATHER_API_PATH,
} from '../../lib/weather.consts';

const fetchWeather = ({ latitude, longitude }: Location) =>
  fetch(
    `${WEATHER_API_PATH}?${new URLSearchParams({
      [QUERY_PARAM.LAT]: String(latitude),
      [QUERY_PARAM.LON]: String(longitude),
    })}`,
  ).then(response =>
    response.ok ? (response.json() as Promise<LocalWeather>) : null,
  );

const fetchPreparation = (weather: LocalWeather) =>
  fetch(PREPARATION_API_PATH, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify(weather),
  }).then(response =>
    response.ok ? (response.json() as Promise<Preparation>) : null,
  );

export function WeatherApp() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4 py-12 text-gray-900 dark:from-slate-900 dark:to-slate-950 dark:text-gray-100">
      <div className="w-full max-w-xl">
        <DashboardInfoCardUtilityContent
          fetchWeather={fetchWeather}
          fetchPreparation={fetchPreparation}
        />
      </div>
    </main>
  );
}
