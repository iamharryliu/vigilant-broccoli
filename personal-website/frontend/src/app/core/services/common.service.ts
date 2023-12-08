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
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/personal-website-common';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}

  BACKEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_BACKEND_URL;

  sendMessage(request: MessageRequest): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`,
      request,
    );
  }

  subscribeToNewsletter(request: EmailSubscriptionRequest): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE}`,
      request,
    );
  }

  verifyEmailSubscription(token: string): Observable<any> {
    return this.http.put<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION}`,
      {token},
    );
  }

  getOutfitRecommendation(location: Location): Observable<any> {
    return this.http.get<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.GET_OUTFIT_RECOMMENDATION}?lat=${location.latitude}&lon=${location.longitude}`,
    );
  }

  subscribeToVibecheckLite(
    request: VibecheckLiteSubscriptionRequest,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE_TO_VIBECHECK_LITE}`,
      request,
    );
  }

  unsubscribeFromVibecheckLite(token: string): Observable<any> {
    return this.http.put<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.UNSUBSCRIBE_FROM_VIBECHECK_LITE}/${token}`,
      {},
    );
  }
}
