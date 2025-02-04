import { Observable } from 'rxjs';
import { Location } from '@vigilant-broccoli/common-js';

export class LocationService {
  getLocation(): Observable<Location> {
    return new Observable(observer => {
      window.navigator.geolocation.getCurrentPosition(position => {
        observer.next({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        observer.complete();
      });
    });
  }
}
