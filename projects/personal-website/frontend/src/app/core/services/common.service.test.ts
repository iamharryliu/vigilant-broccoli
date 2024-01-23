import { CommonService } from '@services/common.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageRequest, SubscribeRequest } from '@models/app.model';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/test-lib';

describe('CommonService', () => {
  let service: CommonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommonService],
    });
    service = TestBed.inject(CommonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('sendMessage', () => {
    it('should make endpoint call', () => {
      service.sendMessage({} as MessageRequest).subscribe(response => {
        expect(response).toBeDefined();
      });
      const req = httpMock.expectOne(
        `${service.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`,
      );
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('subscribeToNewsletter', () => {
    it('should make endpoint call', () => {
      service
        .subscribeToNewsletter({} as SubscribeRequest)
        .subscribe(response => {
          expect(response).toBeDefined();
        });
      const req = httpMock.expectOne(
        `${service.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE}`,
      );
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('verifyEmailSubscription', () => {
    it('should make endpoint call', () => {
      service.verifyEmailSubscription('token').subscribe(response => {
        expect(response).toBeDefined();
      });
      const req = httpMock.expectOne(
        `${service.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION}`,
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });
});
