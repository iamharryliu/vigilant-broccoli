import { ContactComponent } from '@components/features/contact/contact.component';
import { CommonService } from '@services/common.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let commonService: CommonService;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).compileComponents();
    commonService = TestBed.inject(CommonService);
    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
  });

  it('should call commonService.sendMessage on form submission', () => {
    const spy = jest
      .spyOn(commonService, 'sendMessage')
      .mockReturnValue(of({}));
    const testMessage = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    };
    component.form.patchValue(testMessage);
    component.submitForm();
    expect(spy).toHaveBeenCalled();
  });

  it('should reset form after successful message submission', () => {
    jest.spyOn(commonService, 'sendMessage').mockReturnValue(of({}));
    const testMessage = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Another test message',
    };
    component.form.patchValue(testMessage);
    component.submitForm();
    expect(component.form.value).toEqual({
      name: null,
      email: null,
      message: null,
    });
  });
});
