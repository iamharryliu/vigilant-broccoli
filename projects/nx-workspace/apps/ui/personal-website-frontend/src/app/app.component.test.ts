import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { AppComponent } from './app.component';
import { BlogService } from './core/services/blog.service';

window.scrollTo = jest.fn();

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

class MockBlogService {
  getBlogPosts() {
    return of([]);
  }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let _titleService: Title;
  let app: AppComponent;
  let _route: ActivatedRoute;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: BlogService,
          useClass: MockBlogService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: {
              snapshot: {
                data: {},
                params: {
                  filename: '',
                },
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
    _titleService = TestBed.inject(Title);
    _route = TestBed.inject(ActivatedRoute);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });
});
