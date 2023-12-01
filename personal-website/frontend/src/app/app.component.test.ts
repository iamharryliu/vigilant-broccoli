import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppComponent } from '@app/app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

class MockRouter {
  public ne = new NavigationEnd(
    0,
    'http://localhost:4200/login',
    'http://localhost:4200/login',
  );
  public events = new Observable(observer => {
    observer.next(this.ne);
    observer.complete();
  });
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let titleService: Title;
  let app: AppComponent;
  let route: ActivatedRoute;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        Title,
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: {
              snapshot: {
                data: {},
              },
            },
          },
        },

        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    titleService = TestBed.inject(Title);
    route = TestBed.inject(ActivatedRoute);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getTitle and setTitle', () => {
      jest.spyOn(app, 'getTitle');
      jest.spyOn(app, 'setTitle');
      app.ngOnInit();
      expect(app.getTitle).toHaveBeenCalled();
      expect(app.setTitle).toHaveBeenCalled();
    });
  });

  describe('getTitle', () => {
    it('should return title if available', () => {
      const title = 'Test Title';
      (route.firstChild as ActivatedRoute).snapshot.data = { title };
      const result = app.getTitle();
      expect(result).toEqual(title);
    });

    it('should return undefined if title is not available', () => {
      const result = app.getTitle();
      expect(result).toBeUndefined();
    });
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
