
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { exhaustMap } from 'rxjs/operators';
import { LINKS } from '../../../../core/consts/routes.const';
import { VibecheckLiteService } from '../../../../core/services/vibecheck-lite.service';

@Component({
  selector: 'app-unsubscribe-page',
  templateUrl: './unsubscribe.page.html',
  imports: [RouterModule],
})
export class VibecheckLiteUnsubscribePageComponent {
    private vibecheckLiteService = inject(VibecheckLiteService);
    private route = inject(ActivatedRoute);

  hasUnsubscribed = false;
  INDEX_PATH = LINKS.INDEX_PAGE.url.internal;

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
