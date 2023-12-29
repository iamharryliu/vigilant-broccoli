import { CommonService } from '@services/common.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageRequest, EmailSubscriptionRequest } from '@models/app.model';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/personal-website-common';

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
    httpMock.verify(); // Verifies that no requests are outstanding after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a message', () => {
    const messageRequest: MessageRequest = {
    } as MessageRequest;

    service.sendMessage(messageRequest).subscribe(response => {
      expect(response).toBeDefined();
    });

    const req = httpMock.expectOne(`${service.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE}`);
    expect(req.request.method).toBe('POST');
    req.flush({ });
  });

  it('should subscribe to newsletter', () => {
    const subscriptionRequest: EmailSubscriptionRequest = {
    } as EmailSubscriptionRequest;

    service.subscribeToNewsletter(subscriptionRequest).subscribe(response => {
      expect(response).toBeDefined();
    });

    const req = httpMock.expectOne(`${service.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE}`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should verify email subscription', () => {
    const token = 'some-token';

    service.verifyEmailSubscription(token).subscribe(response => {
      expect(response).toBeDefined();
    });

    const req = httpMock.expectOne(`${service.BACKEND_URL}${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION}`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });
});
