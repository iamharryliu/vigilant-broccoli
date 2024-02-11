import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT } from '../../../environments/environment';

@Injectable()
export class SuccessInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (
          event instanceof HttpResponse &&
          event.url != null &&
          event.url.startsWith(ENVIRONMENT.URLS.PERSONAL_WEBSITE_BACKEND_URL) &&
          event.body.message != null
        ) {
          alert(event.body.message);
        }
      }),
    );
  }
}
