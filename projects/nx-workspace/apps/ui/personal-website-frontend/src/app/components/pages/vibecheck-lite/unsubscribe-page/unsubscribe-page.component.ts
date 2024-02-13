import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { exhaustMap } from 'rxjs/operators';
import { LINKS } from '../../../../core/consts/app-route.const';
import { VibecheckLiteService } from '../../../../core/services/vibecheck-lite.service';

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