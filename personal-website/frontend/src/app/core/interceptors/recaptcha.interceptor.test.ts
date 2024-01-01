/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecaptchaInterceptor } from '@interceptors/recaptcha.interceptor';
import { HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha';

describe('RecaptchaInterceptor', () => {
  let interceptor: RecaptchaInterceptor;
  let mockRecaptchaService: ReCaptchaV3Service;
  let mockHandler: HttpHandler;

  beforeEach(() => {
    mockRecaptchaService = {
      execute: jest.fn(() => of('mockToken')),
    } as unknown as ReCaptchaV3Service;

    mockHandler = {
      handle: jest.fn(() => of({} as HttpEvent<any>)),
    } as HttpHandler;

    interceptor = new RecaptchaInterceptor(mockRecaptchaService);
  });

  it('should add recaptchaToken to request body', () => {
    const request = new HttpRequest('POST', 'https://example.com', {
      data: 'sample',
    });

    interceptor.intercept(request, mockHandler).subscribe(() => {
      expect(mockRecaptchaService.execute).toHaveBeenCalledWith('requestType');
      expect(mockHandler.handle).toHaveBeenCalled();

      const modifiedRequest = (mockHandler.handle as jest.Mock).mock
        .calls[0][0] as HttpRequest<any>;
      expect(modifiedRequest.body).toEqual({
        data: 'sample',
        recaptchaToken: 'mockToken',
      });
    });
  });

  it('should not modify request without body', () => {
    const request = new HttpRequest('GET', 'https://example.com');

    interceptor.intercept(request, mockHandler).subscribe(() => {
      expect(mockRecaptchaService.execute).not.toHaveBeenCalled();
      expect(mockHandler.handle).toHaveBeenCalledWith(request);
    });
  });
});
