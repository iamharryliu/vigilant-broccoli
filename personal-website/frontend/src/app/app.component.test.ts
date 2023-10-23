import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from '@app/app.component';

@Component({
  selector: 'app-footer',
  template: '',
})
class FooterMockComponent {}

@Component({
  selector: 'app-navbar',
  template: '',
})
class NavbarMockComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let titleService: Title;
  let app: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, NavbarMockComponent, FooterMockComponent],
      imports: [RouterTestingModule],
      providers: [Title],
    });
    fixture = TestBed.createComponent(AppComponent);
    titleService = TestBed.inject(Title);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeFalsy();
  });

  describe('setTitle', () => {
    it('should call titleService.setTitle', () => {
      const TITLE = 'title';
      jest.spyOn(titleService, 'setTitle');
      app.setTitle(TITLE);
      expect(titleService.setTitle).toHaveBeenCalledWith(
        `design by harry - ${TITLE}`,
      );
    });
  });
});
