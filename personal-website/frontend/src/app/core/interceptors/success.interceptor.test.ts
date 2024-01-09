import { SuccessInterceptor } from '@interceptors/success.interceptor';
import {
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { of } from 'rxjs';

describe('SuccessInterceptor', () => {
  let interceptor: SuccessInterceptor;
  let mockHandler: HttpHandler;

  beforeEach(() => {
    mockHandler = {
      handle: jest.fn(() => of(new HttpResponse())),
    } as unknown as HttpHandler;

    interceptor = new SuccessInterceptor();
  });

  it('should handle HttpResponse with message', () => {
    const mockResponse = new HttpResponse({
      body: {
        message: 'Success message',
      },
      url: 'https://example.com/api',
    });

    jest.spyOn(mockHandler, 'handle').mockReturnValue(of(mockResponse));

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    const request = new HttpRequest('GET', 'https://example.com/api');

    interceptor
      .intercept(request, mockHandler)
      .subscribe((event: HttpEvent<any>) => {
        expect(event).toEqual(mockResponse);
        expect(alertSpy).toHaveBeenCalledWith('Success message');
      });

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should not handle HttpResponse without message', () => {
    const mockResponse = new HttpResponse({
      body: {
        data: 'Some data',
      },
      url: 'https://example.com/api',
    });

    jest.spyOn(mockHandler, 'handle').mockReturnValue(of(mockResponse));

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

    const request = new HttpRequest('GET', 'https://example.com/api');

    interceptor
      .intercept(request, mockHandler)
      .subscribe((event: HttpEvent<any>) => {
        expect(event).toEqual(mockResponse);
        expect(alertSpy).not.toHaveBeenCalled();
      });

    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });
});
