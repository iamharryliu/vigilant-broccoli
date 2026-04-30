import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageRequest } from '@vigilant-broccoli/personal-common-js';

export interface ContactService {
  sendMessage(request: MessageRequest): Observable<unknown>;
}

export const CONTACT_SERVICE = new InjectionToken<ContactService>(
  'CONTACT_SERVICE',
);
