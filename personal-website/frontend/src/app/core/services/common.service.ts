/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import {
  EmailSubscriptionRequest,
  MessageRequest,
  VibecheckLiteSubscriptionRequest,
} from '@models/app.model';
import { Location } from '@prettydamntired/node-tools';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}

  BACKEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_BACKEND_URL;

  sendMessage(request: MessageRequest): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}/contact/send-message`,
      request,
    );
  }

  subscribeToNewsletter(request: EmailSubscriptionRequest): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}/subscribe/email-alerts`,
      request,
    );
  }

  verifyEmailSubscription(token: string): Observable<any> {
    return this.http.put<any>(
      `${this.BACKEND_URL}/subscribe/verify-email-subscription/${token}`,
      {},
    );
  }

  getOutfitRecommendation(location: Location): Observable<any> {
    return this.http.get<any>(
      `${this.BACKEND_URL}/vibecheck-lite/get-outfit-recommendation?lat=${location.latitude}&lon=${location.longitude}`,
    );
  }

  subscribeToVibecheckLite(
    request: VibecheckLiteSubscriptionRequest,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}/vibecheck-lite/subscribe`,
      request,
    );
  }

  unsubscribeFromVibecheckLite(token: string): Observable<any> {
    return this.http.put<any>(
      `${this.BACKEND_URL}/vibecheck-lite/unsubscribe/${token}`,
      {},
    );
  }
}
