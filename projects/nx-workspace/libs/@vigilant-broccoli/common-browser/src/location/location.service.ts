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
}
