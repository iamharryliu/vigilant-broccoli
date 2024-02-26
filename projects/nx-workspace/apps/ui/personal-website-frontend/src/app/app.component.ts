import { Component, HostListener, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import { AppService } from './core/services/app.service';
import { TAILWIND_BREAKPOINTS } from '@prettydamntired/test-lib';

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
  ) {
    this.checkWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.checkWindowSize();
  }

  checkWindowSize() {
    if (window.innerWidth < TAILWIND_BREAKPOINTS.MD) {
      this.appService.setIsMobile();
    } else {
      this.appService.setIsBrowser();
    }
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          window.scrollTo(0, 0);
          this.setTitle(this.getTitle());
        }),
      )
      .subscribe();
  }

  getTitle() {
    const child: ActivatedRoute | null = this.route.firstChild;
    const TITLE = child && child.snapshot.data['title'];
    if (TITLE != null) {
      return TITLE;
    }
  }

  setTitle(title: string) {
    if (title) {
      this.titleService.setTitle(`design by harry - ${title}`);
    }
  }
}
