import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { filter, tap } from 'rxjs';
import { AppService } from './core/services/app.service';
import { TAILWIND_BREAKPOINTS } from '@prettydamntired/test-lib';
import { BlogService } from './core/services/blog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private titleService: Title,
    private appService: AppService,
    private route: ActivatedRoute,
    private blogService: BlogService,
  ) {
    this.checkWindowSize();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          window.scrollTo(0, 0);
          this.setTitle();
        }),
      )
      .subscribe();
  }

  private setTitle(): void {
    const snapshot: ActivatedRouteSnapshot = this.route.firstChild
      ?.snapshot as ActivatedRouteSnapshot;
    const filename = snapshot.params['filename'];
    let title = '';
    if (filename) {
      title = this.blogService.titleCase(filename);
    }
    title = snapshot.data['title'];
    this.titleService.setTitle(`design by harry - ${title}`);
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.checkWindowSize();
  }

  private checkWindowSize() {
    if (window.innerWidth < TAILWIND_BREAKPOINTS.MD) {
      this.appService.setIsMobile();
    } else {
      this.appService.setIsBrowser();
    }
  }
}
