import { TestBed } from '@angular/core/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpRequest,
} from '@angular/common/http';
import { CredentialsInterceptorService } from '@interceptors/credentials.interceptor';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';

describe('CredentialsInterceptorService', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const testUrl = '/test-url';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CredentialsInterceptorService,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add withCredentials to request', () => {
    httpClient.get(testUrl).subscribe();

    const httpRequest = httpMock.expectOne(testUrl);
    expect(httpRequest.request.withCredentials).toEqual(true);
  });

  it('should clone request with withCredentials', () => {
    const interceptor = TestBed.inject(CredentialsInterceptorService);
    const httpRequest = new HttpRequest('GET', testUrl);

    interceptor.intercept(httpRequest, {
      handle: (req: HttpRequest<any>) => {
        expect(req.withCredentials).toEqual(true);
        return null as any;
      },
    });
  });
});
