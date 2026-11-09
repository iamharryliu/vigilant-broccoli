'use client';

import { VB_APP_URL } from '@vigilant-broccoli/infrastructure';
import { WeatherEmbedCard } from '@vigilant-broccoli/react-lib-higher-level';

// NEXT_PUBLIC_* must be read directly here for build-time inlining.
const WEATHER_URL =
  process.env.NEXT_PUBLIC_WEATHER_URL || VB_APP_URL.WEATHER.URL;

export const WeatherView = () => (
  <div className="mx-auto w-full max-w-xl">
    <WeatherEmbedCard weatherUrl={WEATHER_URL} />
  </div>
);
