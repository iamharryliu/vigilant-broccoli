import { Component, effect, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private navigatedSignal = signal<NavigationEnd | null>(null);

  constructor(
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
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
    this.titleService.setTitle(`Cloud8- ${title}`);
  }
}
