import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { createTranslateLoader } from '@app/core/utils/translate.util';

describe('createTranslateLoader', () => {
  let httpClient: HttpClient;
  it('should create TranslateHttpLoader', () => {
    const translateLoader = createTranslateLoader(httpClient);
    expect(translateLoader).toBeInstanceOf(TranslateHttpLoader);
  });
});
