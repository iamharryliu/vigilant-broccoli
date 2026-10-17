'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationService } from '@vigilant-broccoli/common-browser';
import { Location, omitForecast } from '@vigilant-broccoli/common-js';
import { LocalWeather, Preparation } from './weather.types';

export const LOCAL_WEATHER_STATUS = {
  LOCATING: 'LOCATING',
  LOADING_WEATHER: 'LOADING_WEATHER',
  LOCATION_DENIED: 'LOCATION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  WEATHER_ERROR: 'WEATHER_ERROR',
  READY: 'READY',
} as const;

export type LocalWeatherStatus =
  (typeof LOCAL_WEATHER_STATUS)[keyof typeof LOCAL_WEATHER_STATUS];

export type LocalWeatherFailure = Extract<
  LocalWeatherStatus,
  'LOCATION_DENIED' | 'LOCATION_UNAVAILABLE' | 'WEATHER_ERROR'
>;

export type LocalWeatherViewState =
  | {
      status: Exclude<LocalWeatherStatus, typeof LOCAL_WEATHER_STATUS.READY>;
    }
  | {
      status: typeof LOCAL_WEATHER_STATUS.READY;
      weather: LocalWeather;
      location: Location;
    };

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 15_000,
  maximumAge: 10 * 60 * 1000,
};

const locationService = new LocationService();

const loadWeather = async (
  fetchWeather: (location: Location) => Promise<LocalWeather | null>,
  onLocated: () => void,
): Promise<LocalWeatherViewState> => {
  if (!navigator.geolocation) {
    return { status: LOCAL_WEATHER_STATUS.LOCATION_UNAVAILABLE };
  }

  const result = await locationService.getLocation(GEOLOCATION_OPTIONS).then(
    location => ({ location }),
    (error: GeolocationPositionError) => ({ error }),
  );
  if ('error' in result) {
    return {
      status:
        result.error.code === result.error.PERMISSION_DENIED
          ? LOCAL_WEATHER_STATUS.LOCATION_DENIED
          : LOCAL_WEATHER_STATUS.LOCATION_UNAVAILABLE,
    };
  }

  onLocated();
  const weather = await fetchWeather(result.location).catch(() => null);
  return weather
    ? { status: LOCAL_WEATHER_STATUS.READY, weather, location: result.location }
    : { status: LOCAL_WEATHER_STATUS.WEATHER_ERROR };
};

export interface UseLocalWeatherOptions {
  fetchWeather: (location: Location) => Promise<LocalWeather | null>;
  fetchPreparation?: (weather: LocalWeather) => Promise<Preparation | null>;
}

/**
 * Always calls the latest `fetchWeather` / `fetchPreparation`, so inline
 * functions do not reload the weather. Only adding or removing
 * `fetchPreparation` changes whether preparation is requested. `preparation`
 * is `undefined` while pending and `null` when absent or failed.
 */
export const useLocalWeather = ({
  fetchWeather,
  fetchPreparation,
}: UseLocalWeatherOptions) => {
  const [state, setState] = useState<LocalWeatherViewState>({
    status: LOCAL_WEATHER_STATUS.LOCATING,
  });
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
        () => setState({ status: LOCAL_WEATHER_STATUS.LOADING_WEATHER }),
      ).then(setState),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const readyWeather =
    state.status === LOCAL_WEATHER_STATUS.READY ? state.weather : null;
  useEffect(() => {
    setPreparation(hasPreparation ? undefined : null);
    const fetchPreparationNow = fetchPreparationRef.current;
    if (!readyWeather || !fetchPreparationNow) return;
    let cancelled = false;
    fetchPreparationNow(omitForecast(readyWeather))
      .catch(() => null)
      .then(result => {
        if (!cancelled) setPreparation(result);
      });
    return () => {
      cancelled = true;
    };
  }, [readyWeather, hasPreparation]);

  const retry = useCallback(() => {
    setState({ status: LOCAL_WEATHER_STATUS.LOCATING });
    load();
  }, [load]);

  return { state, preparation, retry };
};
