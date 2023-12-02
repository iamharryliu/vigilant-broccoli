import { Observable } from 'rxjs';
import { Location } from '../models/location.model';

export class BrowserLocationService {
  getLocation(): Observable<Location> {
    return new Observable(observer => {
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(position => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        });
      } else {
        observer.error('Unsupported Browser');
      }
    });
  }
}
