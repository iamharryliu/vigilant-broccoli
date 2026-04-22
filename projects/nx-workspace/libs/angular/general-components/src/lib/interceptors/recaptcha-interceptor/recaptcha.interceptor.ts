import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RecaptchaV3Service } from '../../services/recaptcha-v3.service';

const POST = 'POST';

@Injectable()
export class RecaptchaInterceptor implements HttpInterceptor {
  private recaptchaService = inject(RecaptchaV3Service);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (request.method !== POST) {
      return next.handle(request);
    }

    return this.recaptchaService.execute().pipe(
      switchMap(token => {
        const cloned = request.clone({
          body: { ...request.body, recaptchaToken: token },
        });
        return next.handle(cloned);
      }),
    );
  }
}
