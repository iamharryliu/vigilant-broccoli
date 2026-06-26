'use client';

import { useEffect, useState } from 'react';

const GEO_NOT_SUPPORTED = 'Geolocation not supported';

interface GeolocationState {
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

    const watchId = navigator.geolocation.watchPosition(
      pos =>
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        }),
      err => setState(s => ({ ...s, error: err.message })),
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
