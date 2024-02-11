import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { VibecheckLiteService } from '../../../../core/services/vibecheck-lite.service';
import { VibecheckLiteUnsubscribePageComponent } from './unsubscribe-page.component';

describe('VibecheckLiteUnsubscribePageComponent', () => {
  let component: VibecheckLiteUnsubscribePageComponent;
  let fixture: ComponentFixture<VibecheckLiteUnsubscribePageComponent>;
  let mockVibecheckLiteService: jest.Mocked<VibecheckLiteService>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      queryParams: of({ token: 'test@example.com' }),
    };

    mockVibecheckLiteService = {
      unsubscribeFromVibecheckLite: jest.fn(),
    } as unknown as jest.Mocked<VibecheckLiteService>;

    await TestBed.configureTestingModule({
      imports: [VibecheckLiteUnsubscribePageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: VibecheckLiteService, useValue: mockVibecheckLiteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VibecheckLiteUnsubscribePageComponent);
    component = fixture.componentInstance;
  });

  describe('unsubscribe', () => {
    it('should set hasUnsubscribed to true after unsubscribing', () => {
      mockVibecheckLiteService.unsubscribeFromVibecheckLite.mockReturnValue(
        of(null),
      );
      component.unsubscribe();
      expect(component.hasUnsubscribed).toBe(true);
    });
  });
});
