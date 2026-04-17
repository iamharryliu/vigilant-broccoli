import { NgModule, inject, provideAppInitializer } from '@angular/core';
// import { AppService } from './core/services/app.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ENVIRONMENT } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { SuccessInterceptor } from './core/interceptors/success.interceptor';
import {
  CONTACT_SERVICE,
  CredentialsInterceptorService,
  RecaptchaInterceptor,
  ThemeService,
} from 'general-components';
import { CommonService } from './core/services/common.service';
import {
  NgxGoogleAnalyticsModule,
  NgxGoogleAnalyticsRouterModule,
} from 'ngx-google-analytics';

export function initTheme(themeService: ThemeService): () => void {
  return () => themeService.initializeTheme();
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxGoogleAnalyticsModule.forRoot(ENVIRONMENT.ANALYTICS_ID),
    NgxGoogleAnalyticsRouterModule,
  ],
  providers: [
    ThemeService,
    provideAppInitializer(() => {
      const initializerFn = initTheme(inject(ThemeService));
      return initializerFn();
    }),
    {
      provide: CONTACT_SERVICE,
      useExisting: CommonService,
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
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
