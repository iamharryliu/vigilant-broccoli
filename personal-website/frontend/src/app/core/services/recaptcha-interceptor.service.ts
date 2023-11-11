/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, exhaustMap } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Injectable()
export class RecaptchaInterceptor implements HttpInterceptor {
  constructor(private recaptchaV3Service: ReCaptchaV3Service) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return this.recaptchaV3Service.execute('requestType').pipe(
      exhaustMap(token => {
        const modifiedRequest = request.clone({
          body: {
            ...request.body,
            token: token,
          },
        });
        return next.handle(modifiedRequest);
      }),
    );
  }
}
