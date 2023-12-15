/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CredentialsInterceptorService implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const tokenizedRequest = req.clone({
      withCredentials: true,
    });
    return next.handle(tokenizedRequest);
  }
}
