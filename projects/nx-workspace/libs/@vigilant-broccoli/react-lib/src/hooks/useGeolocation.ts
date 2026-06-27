import { useEffect, useState } from 'react';
import { LocationService } from '@vigilant-broccoli/common-browser';

const GEO_NOT_SUPPORTED = 'Geolocation not supported';
const GEO_TIMEOUT_MS = 15000;
const GEO_MAX_AGE_MS = 15000;
const locationService = new LocationService();

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: GEO_NOT_SUPPORTED }));
      return;
    }

    return locationService.watchLocation(
      ({ latitude, longitude }) =>
        setState({ lat: latitude, lng: longitude, error: null }),
      err => setState(s => ({ ...s, error: err.message })),
      {
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: GEO_MAX_AGE_MS,
      },
    );
  }, []);

  return state;
}
