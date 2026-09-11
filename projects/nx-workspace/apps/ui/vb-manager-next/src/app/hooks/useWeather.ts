'use client';

import { useState, useEffect } from 'react';
import {
  DATE_CONST,
  getSunTimes,
  getWeatherIcon,
  Location,
  SunTimes,
  WeatherProvider,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';

export interface SunEvent {
  label: string;
  icon: string;
  ts: number;
}

export interface ForecastDay {
  day: string;
  tempHigh: number;
  tempLow: number;
  icon: string;
}

export interface WeatherData {
  city: string;
  provider: WeatherProvider;
  timezone: number;
  now: {
    temp: number;
    icon: string;
  };
  location: Location;
  forecast: ForecastDay[];
}

const CITIES = [{ name: 'Malmö', lat: 55.605, lon: 13.0038 }];

const MS_PER_DAY = 86400000;
const SUN_EVENT_DAY_OFFSETS = [-1, 0, 1];
const FORECAST_DAY_COUNT = 2;

const SUNRISE_LABEL = 'Sunrise';
const SUNSET_LABEL = 'Sunset';
const SUNRISE_ICON = '🌅';
const SUNSET_ICON = '🌇';

const nextEventTime = (
  location: Location,
  nowMs: number,
  pick: (times: SunTimes) => Date | null,
): number | null => {
  for (const dayOffset of SUN_EVENT_DAY_OFFSETS) {
    const time = pick(
      getSunTimes(location, new Date(nowMs + dayOffset * MS_PER_DAY)),
    );
    if (time && time.getTime() > nowMs) {
      return time.getTime();
    }
  }
  return null;
};

export const getOrderedSunEvents = (
  location: Location,
  nowMs: number,
): SunEvent[] =>
  [
    {
      label: SUNRISE_LABEL,
      icon: SUNRISE_ICON,
      ts: nextEventTime(location, nowMs, times => times.sunrise),
    },
    {
      label: SUNSET_LABEL,
      icon: SUNSET_ICON,
      ts: nextEventTime(location, nowMs, times => times.sunset),
    },
  ]
    .filter((event): event is SunEvent => event.ts !== null)
    .sort((a, b) => a.ts - b.ts);

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return DATE_CONST.DAY[date.getDay()];
};

const toWeatherData = (
  city: (typeof CITIES)[number],
  snapshot: WeatherSnapshot,
): WeatherData => ({
  city: city.name,
  provider: snapshot.provider,
  timezone: snapshot.timezoneOffsetSeconds,
  now: {
    temp: Math.round(snapshot.current.temperatureC),
    icon: getWeatherIcon(snapshot.current.condition, snapshot.current.isDay),
  },
  location: { latitude: city.lat, longitude: city.lon },
  forecast: snapshot.daily.slice(0, FORECAST_DAY_COUNT).map(day => ({
    day: getDayName(day.date),
    tempHigh: Math.round(day.tempMaxC),
    tempLow: Math.round(day.tempMinC),
    icon: getWeatherIcon(day.condition),
  })),
});

export const useWeather = (provider?: WeatherProvider) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPromises = CITIES.map(async city => {
          const params = new URLSearchParams({
            lat: String(city.lat),
            lon: String(city.lon),
            ...(provider ? { provider } : {}),
          });
          const response = await authFetch(`/api/weather?${params}`);

          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }

          const { weather } = await response.json();
          return toWeatherData(city, weather as WeatherSnapshot);
        });

        const data = await Promise.all(weatherPromises);
        setWeatherData(data);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [provider]);

  return { weatherData, loading, error };
};
