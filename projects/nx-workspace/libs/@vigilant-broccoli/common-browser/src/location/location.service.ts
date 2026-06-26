import { Location } from '@vigilant-broccoli/common-js';

export class LocationService {
  getLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      window.navigator.geolocation.getCurrentPosition(
        position =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        reject,
      );
    });
  }

  watchLocation(
    onUpdate: (location: Location) => void,
    onError?: (error: GeolocationPositionError) => void,
    options?: PositionOptions,
  ): () => void {
    const watchId = window.navigator.geolocation.watchPosition(
      position =>
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      onError,
      options,
    );
    return () => window.navigator.geolocation.clearWatch(watchId);
  }
}
