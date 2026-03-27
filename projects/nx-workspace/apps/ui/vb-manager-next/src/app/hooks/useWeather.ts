'use client';

import { useState, useEffect } from 'react';
import { DATE_CONST } from '@vigilant-broccoli/common-js';

export interface WeatherData {
  city: string;
  timezone: number;
  now: {
    temp: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    icon: string;
  }>;
}

const CITIES = [{ name: 'Malm\u00f6', lat: 55.605, lon: 13.0038 }];

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
          const response = await fetch(
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
