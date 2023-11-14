import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppService } from '@services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
    public appService: AppService,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getTitle()),
      )
      .subscribe(title => {
        this.setTitle(title);
      });
  }

  getTitle() {
    const child: ActivatedRoute | null = this.route.firstChild;
    const TITLE = child && child.snapshot.data['title'];
    if (TITLE) {
      return TITLE;
    }
  }

  setTitle(title: string) {
    if (title) {
      this.titleService.setTitle(`design by harry - ${title}`);
    }
  }
}
