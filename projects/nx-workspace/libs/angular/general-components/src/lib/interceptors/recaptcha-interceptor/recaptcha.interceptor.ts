import { inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, exhaustMap } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';

@Injectable()
export class RecaptchaInterceptor implements HttpInterceptor {
  private recaptchaV3Service=inject(ReCaptchaV3Service)

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (request.body == null) {
      return next.handle(request);
    }
    return this.recaptchaV3Service.execute('requestType').pipe(
      exhaustMap(token => {
        const modifiedRequest = request.clone({
          body: {
            ...request.body,
            recaptchaToken: token,
          },
        });
        return next.handle(modifiedRequest);
      }),
    );
  }
}
