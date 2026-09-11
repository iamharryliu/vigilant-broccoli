'use client';

import { Text } from '@vigilant-broccoli/react-lib';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  WEATHER_PROVIDER,
  WEATHER_PROVIDERS,
  WeatherProvider,
} from '@vigilant-broccoli/common-js';
import { useWeather } from '../hooks/useWeather';

const MS_PER_MINUTE = 60000;
const MS_PER_SECOND = 1000;
const TIME_PAD_LENGTH = 2;
const TIME_PAD_CHAR = '0';

const PROVIDER_LABEL: Record<WeatherProvider, string> = {
  [WEATHER_PROVIDER.OPEN_METEO]: 'Open-Meteo',
  [WEATHER_PROVIDER.OPENWEATHER]: 'OpenWeather',
};

const getCurrentTime = (timezoneOffset: number): string => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * MS_PER_MINUTE;
  const cityTime = new Date(utc + timezoneOffset * MS_PER_SECOND);

  const hours = cityTime
    .getHours()
    .toString()
    .padStart(TIME_PAD_LENGTH, TIME_PAD_CHAR);
  const minutes = cityTime
    .getMinutes()
    .toString()
    .padStart(TIME_PAD_LENGTH, TIME_PAD_CHAR);

  return `${hours}:${minutes}`;
};

export const WeatherComponent = () => {
  const [provider, setProvider] = useState<WeatherProvider>(
    WEATHER_PROVIDER.OPEN_METEO,
  );
  const { weatherData, loading, error } = useWeather(provider);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  return (
    <div>
      {weatherData.map(cityWeather => {
        return (
          <div key={cityWeather.city}>
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="flex flex-col justify-start pt-6">
                <Text size="1" weight="bold" className="text-gray-700">
                  {cityWeather.city}
                </Text>
                <Text size="1" className="text-gray-500">
                  {getCurrentTime(cityWeather.timezone)}
                </Text>
              </div>

              <div className="flex flex-col items-center">
                <Text size="1" className="mb-2 text-gray-600">
                  Now
                </Text>
                <div className="text-3xl mb-2">{cityWeather.now.icon}</div>
                <Text size="3" weight="bold">
                  {cityWeather.now.temp}°C
                </Text>
              </div>

              {cityWeather.forecast.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <Text size="1" className="mb-2 text-gray-600">
                    {day.day}
                  </Text>
                  <div className="text-3xl mb-2">{day.icon}</div>
                  <Text size="3" weight="bold">
                    {day.tempHigh}°C{' '}
                    <Text size="2" color="gray">
                      | {day.tempLow}°C
                    </Text>
                  </Text>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <Text size="1" className="text-gray-500">
          Source
        </Text>
        {WEATHER_PROVIDERS.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setProvider(option)}
            className={
              option === provider
                ? 'text-xs font-semibold underline'
                : 'text-xs text-gray-500'
            }
          >
            {PROVIDER_LABEL[option]}
          </button>
        ))}
      </div>
    </div>
  );
};
