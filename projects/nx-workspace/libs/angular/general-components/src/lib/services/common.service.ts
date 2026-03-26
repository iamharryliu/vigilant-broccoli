import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageRequest } from '@prettydamntired/personal-website-lib';

export interface ContactService {
  sendMessage(request: MessageRequest): Observable<unknown>;
}

export const CONTACT_SERVICE = new InjectionToken<ContactService>(
  'CONTACT_SERVICE',
);
