'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NEARBY_ELIGIBILITY_CHECK_INTERVAL_MS,
  NEARBY_MANUAL_REFRESH_COOLDOWN_MS,
  NEARBY_REFRESH_MIN_INTERVAL_MS,
  NEARBY_REFRESH_MIN_MOVEMENT_METRES,
} from '../consts/nearby.consts';
import { Coordinates, distanceMetres } from '../../lib/geo';
import { fetchNearbyPlaces, Place, withDistances } from '../../lib/overpass';

export const NEARBY_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
} as const;

export type NearbyStatus = (typeof NEARBY_STATUS)[keyof typeof NEARBY_STATUS];

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

export function useNearbyPlaces(location: Coordinates | null, active: boolean) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<NearbyStatus>(NEARBY_STATUS.IDLE);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tick, setTick] = useState(0);

  const locationRef = useRef(location);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const lastStartRef = useRef<number | null>(null);
  const lastSuccessLocationRef = useRef<Coordinates | null>(null);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const request = useCallback(async () => {
    const origin = locationRef.current;
    if (!origin || controllerRef.current) return;

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    controllerRef.current = controller;
    hasAttemptedRef.current = true;
    lastStartRef.current = Date.now();
    setStatus(NEARBY_STATUS.LOADING);

    try {
      const result = await fetchNearbyPlaces(origin, controller.signal);
      if (requestId !== requestIdRef.current) return;
      lastSuccessLocationRef.current = origin;
      setPlaces(result);
      setHasLoaded(true);
      setStatus(NEARBY_STATUS.READY);
    } catch (error) {
      if (requestId !== requestIdRef.current || isAbortError(error)) return;
      setStatus(NEARBY_STATUS.ERROR);
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    const lastStart = lastStartRef.current;
    if (
      lastStart !== null &&
      Date.now() - lastStart < NEARBY_MANUAL_REFRESH_COOLDOWN_MS
    ) {
      return;
    }
    void request();
  }, [request]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(
      () => setTick(n => n + 1),
      NEARBY_ELIGIBILITY_CHECK_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active || !location) return;
    if (!hasAttemptedRef.current) {
      void request();
      return;
    }
    const lastSuccessLocation = lastSuccessLocationRef.current;
    const lastStart = lastStartRef.current;
    if (!lastSuccessLocation || lastStart === null) return;
    const moved = distanceMetres(lastSuccessLocation, location);
    const elapsed = Date.now() - lastStart;
    if (
      moved >= NEARBY_REFRESH_MIN_MOVEMENT_METRES &&
      elapsed >= NEARBY_REFRESH_MIN_INTERVAL_MS
    ) {
      void request();
    }
  }, [active, location, tick, request]);

  useEffect(
    () => () => {
      requestIdRef.current++;
      controllerRef.current?.abort();
      controllerRef.current = null;
      hasAttemptedRef.current = false;
      lastStartRef.current = null;
    },
    [],
  );

  const placesWithDistance = useMemo(
    () => (location ? withDistances(places, location) : []),
    [places, location],
  );

  return {
    places: placesWithDistance,
    status,
    hasLoaded,
    refresh,
  };
}
