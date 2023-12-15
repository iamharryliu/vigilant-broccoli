import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { CredentialsInterceptorService } from '@services/credentials-interceptor.service';
import { RecaptchaInterceptor } from '@services/recaptcha-interceptor.service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { ENVIRONMENT } from 'src/environments/environment';
import { AppService } from '@app/core/services/app.service';
import {
  NGX_TRANSLATE_LANGUAGE,
  createTranslateLoader,
} from '@app/core/translate-util';
import { ErrorInterceptor } from '@services/error-interceptor.service';
import { SuccessInterceptor } from '@services/success-interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: NGX_TRANSLATE_LANGUAGE.DEFAULT,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    RecaptchaV3Module,
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: ENVIRONMENT.RECAPTCHA_V3_SITE_KEY,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RecaptchaInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SuccessInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (appService: AppService) => () => appService.init(),
      deps: [AppService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
