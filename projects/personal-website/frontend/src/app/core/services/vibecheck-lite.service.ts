import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VibecheckLiteSubscriptionRequest } from '@models/app.model';
import { ENVIRONMENT } from 'src/environments/environment';
import { Location } from '@prettydamntired/test';

@Injectable({
  providedIn: 'root',
})
export class VibecheckLiteService {
  constructor(private http: HttpClient) {}

  getOutfitRecommendation(location: Location): Observable<any> {
    return this.http.get<any>(
      `${ENVIRONMENT.URLS.VIBECHECK_LITE}/get-outfit-recommendation?lat=${location.latitude}&lon=${location.longitude}`,
    );
  }

  subscribeToVibecheckLite(
    request: VibecheckLiteSubscriptionRequest,
  ): Observable<any> {
    return this.http.post<any>(
      `${ENVIRONMENT.URLS.VIBECHECK_LITE}/subscribe`,
      request,
    );
  }

  unsubscribeFromVibecheckLite(email: string): Observable<any> {
    return this.http.delete<any>(
      `${ENVIRONMENT.URLS.VIBECHECK_LITE}/unsubscribe/${email}`,
    );
  }
}
