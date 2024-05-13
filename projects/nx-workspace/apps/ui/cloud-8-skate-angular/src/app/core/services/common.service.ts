import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  APP_NAME,
  MessageRequest,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
} from '@prettydamntired/personal-website-lib';
import { ENVIRONMENT } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}

  BACKEND_URL = ENVIRONMENT.URLS.PERSONAL_WEBSITE_BACKEND_URL;

  sendMessage(request: MessageRequest): Observable<any> {
    const { email, name, message } = request;
    return this.http.post<any>(
      `${this.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`,
      {
        appName: APP_NAME.HARRYLIU_DESIGN,
        from: `'${name}' <${email}>`,
        subject: 'Message from Cloud8Skate.',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      },
    );
  }
}
