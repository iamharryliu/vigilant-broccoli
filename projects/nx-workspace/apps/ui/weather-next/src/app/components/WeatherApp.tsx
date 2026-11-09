'use client';

import { WeatherClockCardUtilityContent } from '@vigilant-broccoli/react-utility';
import { fetchWeather } from '../../lib/fetch-weather';

export function WeatherApp() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4 py-12 text-gray-900 dark:from-slate-900 dark:to-slate-950 dark:text-gray-100">
      <div className="w-full max-w-xl">
        <WeatherClockCardUtilityContent fetchWeather={fetchWeather} />
      </div>
    </main>
  );
}
