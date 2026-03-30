import {
  Component,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { GeneralLayoutComponent } from './components/layouts/general-layout.component';

@Component({
  imports: [RouterModule, GeneralLayoutComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private navigatedSignal = signal<NavigationEnd | null>(null);
  private router = inject(Router);
  private isBrowser = false;

  constructor() {
    afterNextRender(() => {
      this.isBrowser = true;
    });

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
    if (this.isBrowser) {
      window.scrollTo(0, 0);
    }
    this.navigatedSignal.set(null);
  }
}
