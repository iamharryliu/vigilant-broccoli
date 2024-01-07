import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VibecheckLiteService } from '@services/vibecheck-lite.service';
import { LINKS } from '@consts/app-route.const';
import { exhaustMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-unsubscribe-page',
  templateUrl: './unsubscribe-page.component.html',
  imports: [CommonModule, RouterModule],
})
export class VibecheckLiteUnsubscribePageComponent {
  constructor(
    private vibecheckLiteService: VibecheckLiteService,
    private route: ActivatedRoute,
  ) {}

  hasUnsubscribed = false;
  INDEX_PATH = LINKS.PERSONAL_WEBSITE.url.internal;

  unsubscribeEmail$ = this.route.queryParams.pipe(
    exhaustMap(params => {
      const email = params['token'];
      return this.vibecheckLiteService.unsubscribeFromVibecheckLite(email);
    }),
  );

  unsubscribe() {
    this.unsubscribeEmail$.subscribe(() => {
      this.hasUnsubscribed = true;
    });
  }
}
