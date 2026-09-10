'use client';

import { useState, useEffect } from 'react';
import {
  DATE_CONST,
  getSunTimes,
  Location,
  SunTimes,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';

export interface SunEvent {
  label: string;
  icon: string;
  ts: number;
}

export interface WeatherData {
  city: string;
  timezone: number;
  now: {
    temp: number;
    icon: string;
  };
  location: Location;
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    icon: string;
  }>;
}

const CITIES = [{ name: 'Malm\u00f6', lat: 55.605, lon: 13.0038 }];

const MS_PER_DAY = 86400000;
const MS_PER_SECOND = 1000;
const SUN_EVENT_DAY_OFFSETS = [-1, 0, 1];
const TIME_START_INDEX = 11;
const TIME_END_INDEX = 16;

const SUNRISE_LABEL = 'Sunrise';
const SUNSET_LABEL = 'Sunset';
const SUNRISE_ICON = '\ud83c\udf05';
const SUNSET_ICON = '\ud83c\udf07';

const WEATHER_ICON_MAP: Record<string, string> = {
  '01d': '\u2600\ufe0f',
  '01n': '\ud83c\udf19',
  '02d': '\ud83c\udf24\ufe0f',
  '02n': '\u2601\ufe0f',
  '03d': '\u2601\ufe0f',
  '03n': '\u2601\ufe0f',
  '04d': '\u2601\ufe0f',
  '04n': '\u2601\ufe0f',
  '09d': '\ud83c\udf27\ufe0f',
  '09n': '\ud83c\udf27\ufe0f',
  '10d': '\ud83c\udf26\ufe0f',
  '10n': '\ud83c\udf27\ufe0f',
  '11d': '\u26c8\ufe0f',
  '11n': '\u26c8\ufe0f',
  '13d': '\u2744\ufe0f',
  '13n': '\u2744\ufe0f',
  '50d': '\ud83c\udf2b\ufe0f',
  '50n': '\ud83c\udf2b\ufe0f',
};

export const getWeatherIcon = (iconCode: string): string =>
  WEATHER_ICON_MAP[iconCode] || '\u2601\ufe0f';

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

export const formatSunTime = (ts: number, timezoneOffset: number): string =>
  new Date(ts + timezoneOffset * MS_PER_SECOND)
    .toISOString()
    .slice(TIME_START_INDEX, TIME_END_INDEX);

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return DATE_CONST.DAY[date.getDay()];
};

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPromises = CITIES.map(async city => {
          const response = await authFetch(
            `/api/weather?lat=${city.lat}&lon=${city.lon}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }

          const { current, forecast } = await response.json();

          const dailyForecasts: Record<
            string,
            { temps: number[]; icons: string[] }
          > = {};

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          forecast.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyForecasts[date]) {
              dailyForecasts[date] = { temps: [], icons: [] };
            }
            dailyForecasts[date].temps.push(item.main.temp);
            dailyForecasts[date].icons.push(item.weather[0].icon);
          });

          const forecastDays = Object.entries(dailyForecasts)
            .slice(0, 2)
            .map(([date, data]) => ({
              day: getDayName(date),
              tempHigh: Math.round(Math.max(...data.temps)),
              tempLow: Math.round(Math.min(...data.temps)),
              icon: data.icons[Math.floor(data.icons.length / 2)],
            }));

          return {
            city: city.name,
            timezone: current.timezone,
            now: {
              temp: Math.round(current.main.temp),
              icon: current.weather[0].icon,
            },
            location: { latitude: city.lat, longitude: city.lon },
            forecast: forecastDays,
          };
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
  }, []);

  return { weatherData, loading, error };
};
