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

  subscribeToNewsletter(request: EmailSubscriptionRequest): Observable<any> {
    return this.http.post<any>(
      `${ENVIRONMENT.PERSONAL_WEBSITE_BACKEND_URL}/email-alerts`,
      request,
    );
  }

  sendMessage(request: MessageRequest): Observable<any> {
    return this.http.post<any>(
      `${ENVIRONMENT.PERSONAL_WEBSITE_BACKEND_URL}/send-message`,
      request,
    );
  }

  getOutfitRecommendation(location: Location): Observable<any> {
    return this.http.get<any>(
      `${ENVIRONMENT.PERSONAL_WEBSITE_BACKEND_URL}/get-outfit-recommendation?lat=${location.latitude}&lon=${location.longitude}`,
    );
  }
}
