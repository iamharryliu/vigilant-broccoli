import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export const NGX_TRANSLATE_LANGUAGE = { DEFAULT: 'en' };
const NGX_TRANSLATE_DIR_PATH = './assets/i18n/';
const NGX_TRANSLATE_FILE_EXTENSION = '.json';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    NGX_TRANSLATE_DIR_PATH,
    NGX_TRANSLATE_FILE_EXTENSION,
  );
}
