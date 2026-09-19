'use client';

import { useState, useEffect } from 'react';
import {
  DATE_CONST,
  getWeatherIcon,
  Location,
  WeatherCondition,
  WeatherProvider,
  WeatherSnapshot,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';

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
    condition: WeatherCondition;
    isDay: boolean;
  };
  location: Location;
  forecast: ForecastDay[];
}

const CITIES = [{ name: 'Malmö', lat: 55.605, lon: 13.0038 }];

const FORECAST_DAY_COUNT = 2;

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
    condition: snapshot.current.condition,
    isDay: snapshot.current.isDay,
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
