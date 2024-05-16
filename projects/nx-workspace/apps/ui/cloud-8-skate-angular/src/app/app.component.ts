import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { filter, tap } from 'rxjs';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
  ) {}

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
    let title = '';
    title = snapshot.data['title'];
    this.titleService.setTitle(`Cloud8- ${title}`);
  }
}
