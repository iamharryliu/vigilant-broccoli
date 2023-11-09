/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import {
  EmailSubscriptionRequest,
  Location,
  MessageRequest,
} from '@models/app.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}

  BACKEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_BACKEND_URL;

  subscribeToNewsletter(request: EmailSubscriptionRequest): Observable<any> {
    return this.http.post<any>(`${this.BACKEND_URL}/email-alerts`, request);
  }

  sendMessage(request: MessageRequest): Observable<any> {
    return this.http.post<any>(`${this.BACKEND_URL}/send-message`, request);
  }

  getOutfitRecommendation(location: Location): Observable<any> {
    return this.http.get<any>(
      `${this.BACKEND_URL}/get-outfit-recommendation?lat=${location.latitude}&lon=${location.longitude}`,
    );
  }

  verifyEmailSubscription(token: string): Observable<any> {
    return this.http.put<any>(
      `${this.BACKEND_URL}/verify-email-subscription/${token}`,
      {},
    );
  }
}
