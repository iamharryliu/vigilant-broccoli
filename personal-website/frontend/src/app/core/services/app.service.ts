import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NGX_TRANSLATE_LANGUAGE } from '@app/core/translate-util';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private translateService: TranslateService) {}
  init() {
    return this.translateService.use(NGX_TRANSLATE_LANGUAGE.DEFAULT);
  }
}
