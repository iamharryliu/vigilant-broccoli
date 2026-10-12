'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationService } from '@vigilant-broccoli/common-browser';
import { Location, toDisplayTemperature } from '@vigilant-broccoli/common-js';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { WeatherCard, WeatherDisplay } from '../components/WeatherDisplay';
import { cn } from '../utils/cn';
import { PREPARATION_BADGES } from './weather.consts';
import { useTranslation, WeatherI18nProvider } from './weather.i18n';
import { LocalWeather, Preparation } from './weather.types';

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

const loadWeather = async (
  fetchWeather: LocalWeatherPanelProps['fetchWeather'],
  onLocated: () => void,
): Promise<ViewState> => {
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
  const weather = await fetchWeather(result.location).catch(() => null);
  return weather
    ? { status: STATUS.READY, weather }
    : { status: STATUS.WEATHER_ERROR };
};

export interface LocalWeatherPanelProps {
  fetchWeather: (location: Location) => Promise<LocalWeather | null>;
  fetchPreparation?: (weather: LocalWeather) => Promise<Preparation | null>;
  className?: string;
}

const LocalWeatherPanelContent = ({
  fetchWeather,
  fetchPreparation,
  className,
}: LocalWeatherPanelProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<ViewState>({ status: STATUS.LOCATING });
  const [preparation, setPreparation] = useState<Preparation | null>();

  const fetchWeatherRef = useRef(fetchWeather);
  const fetchPreparationRef = useRef(fetchPreparation);
  fetchWeatherRef.current = fetchWeather;
  fetchPreparationRef.current = fetchPreparation;
  const hasPreparation = !!fetchPreparation;

  const load = useCallback(
    () =>
      loadWeather(
        location => fetchWeatherRef.current(location),
        () => setState({ status: STATUS.LOADING_WEATHER }),
      ).then(setState),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const readyWeather = state.status === STATUS.READY ? state.weather : null;
  useEffect(() => {
    setPreparation(hasPreparation ? undefined : null);
    const fetchPreparationNow = fetchPreparationRef.current;
    if (!readyWeather || !fetchPreparationNow) return;
    let cancelled = false;
    fetchPreparationNow(readyWeather)
      .catch(() => null)
      .then(result => {
        if (!cancelled) setPreparation(result);
      });
    return () => {
      cancelled = true;
    };
  }, [readyWeather, hasPreparation]);

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
    humidityPercent,
    windSpeedKph,
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
      humidity={t('WEATHER.HUMIDITY', {
        percent: Math.round(humidityPercent),
      })}
      wind={t('WEATHER.WIND', { speed: Math.round(windSpeedKph) })}
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
        return (
          <>
            {renderWeather(state.weather)}
            {fetchPreparation && preparation === undefined && (
              <div
                className="mt-4 flex flex-col items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <div className="flex gap-2" aria-hidden="true">
                  <Skeleton className="h-7 w-32 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('STATUS.LOADING_PREPARATION')}
                </p>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6',
        className,
      )}
    >
      <WeatherCard>{renderContent()}</WeatherCard>
      <footer className="text-xs text-muted-foreground">
        {t('ATTRIBUTION.WEATHER')} <span aria-hidden>{SEPARATOR}</span>{' '}
        {t('ATTRIBUTION.LOCATION')}
      </footer>
    </div>
  );
};

export const LocalWeatherPanel = (props: LocalWeatherPanelProps) => (
  <WeatherI18nProvider>
    <LocalWeatherPanelContent {...props} />
  </WeatherI18nProvider>
);
