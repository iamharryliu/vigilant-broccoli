/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';

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
          event.url?.startsWith(
            ENVIRONMENT.URLS.PERSONAL_WEBSITE_BACKEND_URL,
          ) &&
          event.body.message
        ) {
          alert(event.body.message);
        }
      }),
    );
  }
}
