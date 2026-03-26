import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { AppService } from './core/services/app.service';
import { TAILWIND_BREAKPOINTS } from '@vigilant-broccoli/common-browser';
import { ENVIRONMENT } from '../environments/environment';
import { DEFAULT_DESCRIPTION } from './core/consts/routes.const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  private navigatedSignal = signal<NavigationEnd | null>(null);

  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
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
    this.updateSeoTags();
    this.navigatedSignal.set(null);
  }

  private updateSeoTags(): void {
    const snapshot: ActivatedRouteSnapshot = this.route.firstChild
      ?.snapshot as ActivatedRouteSnapshot;
    const title = snapshot.data['title'];
    const description = snapshot.data['description'] ?? DEFAULT_DESCRIPTION;
    const fullTitle = `design by harry - ${title}`;
    const url = `${ENVIRONMENT.APP_URL}${this.router.url}`;

    this.titleService.setTitle(fullTitle);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({
      property: 'og:description',
      content: description,
    });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: description,
    });
    this.updateCanonicalUrl(url);
  }

  private updateCanonicalUrl(url: string): void {
    const link: HTMLLinkElement | null = document.querySelector(
      'link[rel="canonical"]',
    );
    if (link) {
      link.setAttribute('href', url);
    }
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
