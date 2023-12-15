import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { APP_PATH } from '@consts/app-route.const';
import { CommonService } from '@services/common.service';
import { exhaustMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-unsubscribe-page',
  templateUrl: './unsubscribe-page.component.html',
  imports: [CommonModule, RouterModule],
  providers: [CommonService],
})
export class VibecheckLiteUnsubscribePageComponent {
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) {}

  hasUnsubscribed = false;
  INDEX_PATH = APP_PATH.INDEX;

  unsubscribeEmail$ = this.route.queryParams.pipe(
    exhaustMap(params => {
      const encryptedEmail = params['token'];
      return this.commonService.unsubscribeFromVibecheckLite(encryptedEmail);
    }),
  );

  unsubscribe() {
    this.unsubscribeEmail$.subscribe(() => {
      this.hasUnsubscribed = true;
    });
  }
}
