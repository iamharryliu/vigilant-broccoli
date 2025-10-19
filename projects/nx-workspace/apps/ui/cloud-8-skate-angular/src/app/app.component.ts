import { Component, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { GeneralLayoutComponent } from './components/layouts/general-layout.component';

@Component({
  imports: [RouterModule, GeneralLayoutComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private navigatedSignal = signal<NavigationEnd | null>(null);

    private router =  inject(Router);
    private titleService =  inject(Title);
    private route =  inject(ActivatedRoute);
    private meta =  inject(Meta);

  constructor(
  ) {
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

    this.meta.addTag({
      name: 'description',
      content:
        'Join Cloud8, Toronto’s skate community for inline skates, rollerblades, quad skates, roller skates, and ice skates. Find events, tips, and more!',
    });
  }

  private handlePageNavigate() {
    window.scrollTo(0, 0);
    this.setTitle();
    this.navigatedSignal.set(null);
  }

  private setTitle(): void {
    const snapshot: ActivatedRouteSnapshot = this.route.firstChild
      ?.snapshot as ActivatedRouteSnapshot;
    let title = '';
    title = snapshot.data['title'];
    this.titleService.setTitle(
      `Cloud8Skate - Toronto Inline, Rollerblade, Quad, and Ice Skate Community - ${title}`,
    );
  }
}
