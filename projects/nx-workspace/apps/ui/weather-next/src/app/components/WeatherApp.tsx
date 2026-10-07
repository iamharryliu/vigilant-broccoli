'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Skeleton,
  WeatherCard,
  WeatherDisplay,
} from '@vigilant-broccoli/react-lib';
import { LocationService } from '@vigilant-broccoli/common-browser';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  Location,
  toDisplayTemperature,
} from '@vigilant-broccoli/common-js';
import {
  PREPARATION_API_PATH,
  PREPARATION_BADGES,
  QUERY_PARAM,
  WEATHER_API_PATH,
} from '../../lib/weather.consts';
import { LocalWeather, Preparation } from '../../lib/weather.types';
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

const fetchPreparation = (weather: LocalWeather) =>
  fetch(PREPARATION_API_PATH, {
    method: HTTP_METHOD.POST,
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
    body: JSON.stringify(weather),
  })
    .then(response =>
      response.ok ? (response.json() as Promise<Preparation>) : null,
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

export function WeatherApp() {
  const { t } = useTranslation();
  const [state, setState] = useState<ViewState>({ status: STATUS.LOCATING });
  const [preparation, setPreparation] = useState<Preparation | null>(null);

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

  const readyWeather = state.status === STATUS.READY ? state.weather : null;
  useEffect(() => {
    setPreparation(null);
    if (!readyWeather) return;
    let cancelled = false;
    fetchPreparation(readyWeather).then(result => {
      if (!cancelled) setPreparation(result);
    });
    return () => {
      cancelled = true;
    };
  }, [readyWeather]);

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
    <WeatherDisplay
      city={city ?? t('LOCATION.FALLBACK')}
      condition={condition}
      isDay={isDay}
      current={t('WEATHER.CURRENT', {
        temperature: toDisplayTemperature(temperatureC),
        condition: t(`CONDITION.${condition}`),
      })}
      high={t('WEATHER.HIGH', { temperature: toDisplayTemperature(highC) })}
      low={t('WEATHER.LOW', { temperature: toDisplayTemperature(lowC) })}
      feelsLike={t('WEATHER.FEELS_LIKE', {
        temperature: toDisplayTemperature(feelsLikeC),
      })}
      badges={PREPARATION_BADGES.filter(({ key }) => preparation?.[key]).map(
        ({ key, icon, labelKey }) => ({ key, icon, label: t(labelKey) }),
      )}
    />
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
      <WeatherCard>{renderContent()}</WeatherCard>
    </main>
  );
}
