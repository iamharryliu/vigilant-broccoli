/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VibecheckLiteSubscriptionRequest } from '@models/app.model';
import { Location } from '@prettydamntired/node-tools';

// const VIBECHECK_LITE_API_URL = 'http://127.0.0.1:3000'
const VIBECHECK_LITE_API_URL = 'https://vibecheck-lite-express.fly.dev';

@Injectable({
  providedIn: 'root',
})
export class VibecheckLiteService {
  constructor(private http: HttpClient) {}

  getOutfitRecommendation(location: Location): Observable<any> {
    return this.http.get<any>(
      `${VIBECHECK_LITE_API_URL}/get-outfit-recommendation?lat=${location.latitude}&lon=${location.longitude}`,
    );
  }

  subscribeToVibecheckLite(
    request: VibecheckLiteSubscriptionRequest,
  ): Observable<any> {
    return this.http.post<any>(`${VIBECHECK_LITE_API_URL}/subscribe`, request);
  }

  unsubscribeFromVibecheckLite(email: string): Observable<any> {
    return this.http.delete<any>(
      `${VIBECHECK_LITE_API_URL}/unsubscribe/${email}`,
    );
  }
}
