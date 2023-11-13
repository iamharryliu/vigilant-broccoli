/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private translateService: TranslateService) {}
  init() {
    return () => {
      return this.translateService.use('en');
    };
  }
}
