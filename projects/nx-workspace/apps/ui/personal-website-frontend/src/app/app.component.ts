import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { AppService } from './core/services/app.service';
import { TAILWIND_BREAKPOINTS } from '@vigilant-broccoli/common-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  private navigatedSignal = signal<NavigationEnd | null>(null);

  private router = inject(Router);
  private titleService = inject(Title);
  private appService = inject(AppService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.checkWindowSize();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.navigatedSignal.set(event);
      }
    });

    effect(
      () => {
        if (this.navigatedSignal()) {
          this.handlePageNavigate();
        }
      },
      { allowSignalWrites: true },
    );
  }

  private handlePageNavigate() {
    window.scrollTo(0, 0);
    this.setTitle();
    this.navigatedSignal.set(null);
  }

  private setTitle(): void {
    const snapshot: ActivatedRouteSnapshot = this.route.firstChild
      ?.snapshot as ActivatedRouteSnapshot;
    const title = snapshot.data['title'];
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
