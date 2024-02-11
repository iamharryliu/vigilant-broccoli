import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';

@Component({
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
