import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VibecheckLiteService } from '@services/vibecheck-lite.service';
import { APP_PATH } from '@consts/app-route.const';
import { exhaustMap } from 'rxjs';

// TODO: rename files
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
  INDEX_PATH = APP_PATH.INDEX;

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
