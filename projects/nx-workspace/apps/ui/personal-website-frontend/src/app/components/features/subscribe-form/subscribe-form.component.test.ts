import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { NewsLetterSubFormComponent } from './subscribe-form.component';

describe('NewsLetterSubFormComponent', () => {
  let component: NewsLetterSubFormComponent;
  let commonServiceMock: Partial<CommonService>;

  beforeEach(() => {
    commonServiceMock = {
      subscribeToNewsletter: jest.fn(),
    };

    component = new NewsLetterSubFormComponent(
      commonServiceMock as CommonService,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with email FormControl', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('email')).toBeInstanceOf(FormControl);
  });

  it('should have email field as required', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalidemail');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should call commonService.subscribeToNewsletter and reset form on submit', () => {
    const email = 'test@example.com';
    const emailRequest = { email };
    const formValue = { email };

    commonServiceMock.subscribeToNewsletter = jest.fn(() => of(true));

    component.form.patchValue(formValue);
    component.submit();

    expect(commonServiceMock.subscribeToNewsletter).toHaveBeenCalledWith(
      emailRequest,
    );
    expect(component.form.value).toEqual({ email: null });
  });
});
