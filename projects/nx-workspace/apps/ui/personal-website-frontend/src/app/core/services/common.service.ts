import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MessageRequest,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
} from '@vigilant-broccoli/personal-common-js';
import { ENVIRONMENT } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private http = inject(HttpClient);
  private apiUrl = ENVIRONMENT.API_URL;

  sendMessage(request: MessageRequest): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`,
      request,
    );
  }
}
