import { Observable } from 'rxjs';
// TODO: refactor into frontend node tools library
export interface Location {
  latitude: number;
  longitude: number;
}
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
