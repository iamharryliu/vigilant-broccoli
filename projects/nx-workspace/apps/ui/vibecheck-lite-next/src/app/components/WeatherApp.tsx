'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Skeleton } from '@vigilant-broccoli/react-lib';
import { LocationService } from '@vigilant-broccoli/common-browser';
import { getWeatherIcon, Location } from '@vigilant-broccoli/common-js';
import { QUERY_PARAM, WEATHER_API_PATH } from '../../lib/weather.consts';
import { LocalWeather } from '../../lib/weather.types';
import { useTranslation } from '../i18n';

const STATUS = {
  LOCATING: 'LOCATING',
  LOADING_WEATHER: 'LOADING_WEATHER',
  LOCATION_DENIED: 'LOCATION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  WEATHER_ERROR: 'WEATHER_ERROR',
  READY: 'READY',
} as const;

type ViewState =
  | { status: Exclude<(typeof STATUS)[keyof typeof STATUS], 'READY'> }
  | { status: typeof STATUS.READY; weather: LocalWeather };

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 15_000,
  maximumAge: 10 * 60 * 1000,
};

const LOCATION_ICON = '📍';
const ERROR_ICON = '🌥️';
const SEPARATOR = '·';

const locationService = new LocationService();

const fetchWeather = ({ latitude, longitude }: Location) =>
  fetch(
    `${WEATHER_API_PATH}?${new URLSearchParams({
      [QUERY_PARAM.LAT]: String(latitude),
      [QUERY_PARAM.LON]: String(longitude),
    })}`,
  )
    .then(response =>
      response.ok ? (response.json() as Promise<LocalWeather>) : null,
    )
    .catch(() => null);

const loadWeather = async (onLocated: () => void): Promise<ViewState> => {
  if (!navigator.geolocation) return { status: STATUS.LOCATION_UNAVAILABLE };

  const result = await locationService.getLocation(GEOLOCATION_OPTIONS).then(
    location => ({ location }),
    (error: GeolocationPositionError) => ({ error }),
  );
  if ('error' in result) {
    return {
      status:
        result.error.code === result.error.PERMISSION_DENIED
          ? STATUS.LOCATION_DENIED
          : STATUS.LOCATION_UNAVAILABLE,
    };
  }

  onLocated();
  const weather = await fetchWeather(result.location);
  return weather
    ? { status: STATUS.READY, weather }
    : { status: STATUS.WEATHER_ERROR };
};

const roundTemperature = (celsius: number) => Math.round(celsius);

export function WeatherApp() {
  const { t } = useTranslation();
  const [state, setState] = useState<ViewState>({ status: STATUS.LOCATING });

  const load = useCallback(
    () =>
      loadWeather(() => setState({ status: STATUS.LOADING_WEATHER })).then(
        setState,
      ),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setState({ status: STATUS.LOCATING });
    load();
  };

  const renderMessage = (icon: string, title: string, message: string) => (
    <div className="flex flex-col items-center gap-3">
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      <Button
        onClick={retry}
        className="mt-3 bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
      >
        {t('ACTIONS.RETRY')}
      </Button>
    </div>
  );

  const renderLoading = (label: string) => (
    <div
      className="flex flex-col items-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-24" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );

  const renderWeather = ({
    city,
    temperatureC,
    feelsLikeC,
    highC,
    lowC,
    condition,
    isDay,
  }: LocalWeather) => (
    <div className="flex flex-col items-center gap-2">
      <h1 className="text-xl font-medium">{city ?? t('LOCATION.FALLBACK')}</h1>
      <span className="my-2 text-7xl leading-none" aria-hidden>
        {getWeatherIcon(condition, isDay)}
      </span>
      <p className="text-4xl font-light tracking-tight">
        {t('WEATHER.CURRENT', {
          temperature: roundTemperature(temperatureC),
          condition: t(`CONDITION.${condition}`),
        })}
      </p>
      <p className="text-base text-gray-700 dark:text-gray-300">
        {t('WEATHER.HIGH', { temperature: roundTemperature(highC) })}{' '}
        <span aria-hidden>{SEPARATOR}</span>{' '}
        {t('WEATHER.LOW', { temperature: roundTemperature(lowC) })}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('WEATHER.FEELS_LIKE', { temperature: roundTemperature(feelsLikeC) })}
      </p>
    </div>
  );

  const renderContent = () => {
    switch (state.status) {
      case STATUS.LOCATING:
        return renderLoading(t('STATUS.LOCATING'));
      case STATUS.LOADING_WEATHER:
        return renderLoading(t('STATUS.LOADING_WEATHER'));
      case STATUS.LOCATION_DENIED:
        return renderMessage(
          LOCATION_ICON,
          t('LOCATION.DENIED_TITLE'),
          t('LOCATION.DENIED_MESSAGE'),
        );
      case STATUS.LOCATION_UNAVAILABLE:
        return renderMessage(
          LOCATION_ICON,
          t('LOCATION.UNAVAILABLE_TITLE'),
          t('LOCATION.UNAVAILABLE_MESSAGE'),
        );
      case STATUS.WEATHER_ERROR:
        return renderMessage(
          ERROR_ICON,
          t('WEATHER.ERROR_TITLE'),
          t('WEATHER.ERROR_MESSAGE'),
        );
      case STATUS.READY:
        return renderWeather(state.weather);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-sky-50 to-white px-6 py-12 text-gray-900 dark:from-slate-900 dark:to-slate-950 dark:text-gray-100">
      <Card className="w-full max-w-sm px-8 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        {renderContent()}
      </Card>
      <footer className="text-xs text-gray-400 dark:text-gray-500">
        {t('ATTRIBUTION.WEATHER')} <span aria-hidden>{SEPARATOR}</span>{' '}
        {t('ATTRIBUTION.LOCATION')}
      </footer>
    </main>
  );
}
