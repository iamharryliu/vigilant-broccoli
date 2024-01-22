import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { SubscribeRequest, MessageRequest } from '@models/app.model';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/test';

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
