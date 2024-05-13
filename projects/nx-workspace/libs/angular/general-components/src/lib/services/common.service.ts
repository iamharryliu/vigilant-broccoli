import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  APP_NAME,
  MessageRequest,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
} from '@prettydamntired/personal-website-lib';

const APP_MAPPER = {
  [APP_NAME.HARRYLIU_DESIGN]: {
    endpoint: 'https://api.harryliu.design',
  },
  [APP_NAME.CLOUD_8_SKATE]: {
    endpoint: 'https://api.harryliu.design',
  },
};

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}

  sendMessage(request: MessageRequest): Observable<any> {
    const { appName, email, name, message } = request;
    return this.http.post<any>(
      `${APP_MAPPER[appName].endpoint}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`,
      {
        appName: appName,
        from: `'${name}' <${email}>`,
        subject: `${appName} - Message from ${name}(${email})`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      },
    );
  }
}
