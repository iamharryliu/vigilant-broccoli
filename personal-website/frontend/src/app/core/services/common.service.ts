import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';
import { MessageRequest } from '@models/app.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}

  subscribeToNewsletter(email: string): Observable<any> {
    return this.http.post<any>(
      `${ENVIRONMENT.PERSONAL_WEBSITE_BACKEND_URL}/email-alerts`,
      { email: email },
    );
  }

  sendMessage(messageRequest: MessageRequest): Observable<any> {
    return this.http.post<any>(
      `${ENVIRONMENT.PERSONAL_WEBSITE_BACKEND_URL}/send-message`,
      messageRequest,
    );
  }

  getOutfitRecommendation(): Observable<any> {
    return this.http.get<any>(
      `${
        ENVIRONMENT.PERSONAL_WEBSITE_BACKEND_URL
      }/get-outfit-recommendation?lat=${43}&lon=${-79}`,
    );
  }
}
