import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { SubscribeRequest, MessageRequest } from '@models/app.model';

export const PERSONAL_WEBSITE_DB_DATABASES = {
  DEV: 'test',
  PROD: 'personal-website-db',
};

export const PERSONAL_WEBSITE_DB_COLLECTIONS = {
  EMAIL_SUBSCRIPTIONS: 'emailSubscriptions'.toLowerCase(),
};

const VIBECHECK_LITE_ENDPOINTS = {
  SUBSCRIBE_TO_VIBECHECK_LITE: '/vibecheck-lite/subscribe',
  UNSUBSCRIBE_FROM_VIBECHECK_LITE: '/vibecheck-lite/unsubscribe',
  GET_OUTFIT_RECOMMENDATION: '/get-outfit-recommendation',
};

// TODO: move to package??
export const PERSONAL_WEBSITE_BACKEND_ENDPOINTS = {
  SEND_MESSAGE: '/contact/send-message',
  SUBSCRIBE: '/subscribe/email-alerts',
  VERIFY_SUBSCRIPTION: '/subscribe/verify-email-subscription',
  ...VIBECHECK_LITE_ENDPOINTS,
};

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

  subscribeToNewsletter(request: SubscribeRequest): Observable<any> {
    return this.http.post<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE}`,
      request,
    );
  }

  verifyEmailSubscription(token: string): Observable<any> {
    return this.http.put<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION}`,
      { token },
    );
  }
}
