import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from '@app/app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let titleService: Title;
  let app: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [Title],
    });
    fixture = TestBed.createComponent(AppComponent);
    titleService = TestBed.inject(Title);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('setTitle', () => {
    it('should call titleService.setTitle if a title is passed to the fn', () => {
      const TITLE = 'title';
      jest.spyOn(titleService, 'setTitle');
      app.setTitle(TITLE);
      expect(titleService.setTitle).toHaveBeenCalledWith(
        `design by harry - ${TITLE}`,
      );
    });
  });

  it('should not call titleService.setTitle if a title is not passed to the fn', () => {
    const TITLE = '';
    jest.spyOn(titleService, 'setTitle');
    app.setTitle(TITLE);
    expect(titleService.setTitle).not.toHaveBeenCalled();
  });
});
