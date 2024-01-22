import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VibecheckLiteService } from '@app/core/services/vibecheck-lite.service';
import { VibecheckLiteSubscriptionRequest } from '@models/app.model';
import { ENVIRONMENT } from 'src/environments/environment';
import { Location } from '@prettydamntired/test';

describe('VibecheckLiteService', () => {
  let service: VibecheckLiteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(VibecheckLiteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get outfit recommendation', () => {
    const mockLocation: Location = {
      latitude: 40.7128,
      longitude: -74.006,
    };
    const mockResponse = {};

    service.getOutfitRecommendation(mockLocation).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const request = httpMock.expectOne(
      `${ENVIRONMENT.URLS.VIBECHECK_LITE}/get-outfit-recommendation?lat=${mockLocation.latitude}&lon=${mockLocation.longitude}`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(mockResponse);
  });

  it('should subscribe to Vibecheck Lite', () => {
    const mockRequest: VibecheckLiteSubscriptionRequest = {
      email: 'email',
      latitude: 42,
      longitude: 42,
    };
    const mockResponse = {};

    service.subscribeToVibecheckLite(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const request = httpMock.expectOne(
      `${ENVIRONMENT.URLS.VIBECHECK_LITE}/subscribe`,
    );
    expect(request.request.method).toBe('POST');
    request.flush(mockResponse);
  });

  it('should unsubscribe from Vibecheck Lite', () => {
    const mockEmail = 'test@example.com';
    const mockResponse = {};

    service.unsubscribeFromVibecheckLite(mockEmail).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const request = httpMock.expectOne(
      `${ENVIRONMENT.URLS.VIBECHECK_LITE}/unsubscribe/${mockEmail}`,
    );
    expect(request.request.method).toBe('DELETE');
    request.flush(mockResponse);
  });
});
