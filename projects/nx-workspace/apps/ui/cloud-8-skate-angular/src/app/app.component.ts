import { Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { GeneralLayoutComponent } from './components/layouts/general-layout.component';
import { ENVIRONMENT } from '../environments/environment';
import { filter, skip } from 'rxjs/operators';

@Component({
  imports: [RouterModule, GeneralLayoutComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private navigatedSignal = signal<NavigationEnd | null>(null);
  private router = inject(Router);

  constructor() {
    if (ENVIRONMENT.ANALYTICS_ID) {
      this.initAnalytics(ENVIRONMENT.ANALYTICS_ID);
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.navigatedSignal.set(event);
      }
    });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        skip(1), // gtag('config') on init already sends the first page view
      )
      .subscribe(event => {
        if (ENVIRONMENT.ANALYTICS_ID) {
          window.gtag('config', ENVIRONMENT.ANALYTICS_ID, {
            page_path: event.urlAfterRedirects,
            page_location: document.location.href,
          });
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

  private initAnalytics(id: string) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  private handlePageNavigate() {
    window.scrollTo(0, 0);
    this.navigatedSignal.set(null);
  }
}
