import { ErrorInterceptor } from '@interceptors/error.interceptor';
import {
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError } from 'rxjs';

window.alert = jest.fn();

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let mockHandler: HttpHandler;

  beforeEach(() => {
    mockHandler = {
      handle: jest.fn(() =>
        throwError(
          () => new HttpErrorResponse({ error: 'mock error', status: 500 }),
        ),
      ),
    } as HttpHandler;
    interceptor = new ErrorInterceptor();
  });

  it('should catch and handle HTTP errors', () => {
    const request = new HttpRequest('GET', 'https://example.com');

    interceptor.intercept(request, mockHandler).subscribe({
      next: () => null,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(error.error).toEqual('mock error');
        expect(error.status).toEqual(500);
      },
    });

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should handle client-side errors', () => {
    const errorEvent = new ErrorEvent('error', {
      error: new Error('client-side error'),
    });
    const mockErrorResponse = new HttpErrorResponse({ error: errorEvent });

    const request = new HttpRequest('GET', 'https://example.com');

    jest
      .spyOn(mockHandler, 'handle')
      .mockReturnValue(throwError(() => mockErrorResponse));

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    interceptor.intercept(request, mockHandler).subscribe({
      next: () => null,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(alertSpy).toHaveBeenCalledWith(
          `This is a client side error: client-side error`,
        );
      },
    });

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should handle server-side errors', () => {
    const mockErrorResponse = new HttpErrorResponse({
      error: 'server-side error',
      status: 500,
    });

    const request = new HttpRequest('GET', 'https://example.com');

    jest
      .spyOn(mockHandler, 'handle')
      .mockReturnValue(throwError(() => mockErrorResponse));

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    interceptor.intercept(request, mockHandler).subscribe({
      next: () => null,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect(alertSpy).toHaveBeenCalledWith(
          `This is a server side error:\nserver-side error`,
        );
      },
    });

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });
});
