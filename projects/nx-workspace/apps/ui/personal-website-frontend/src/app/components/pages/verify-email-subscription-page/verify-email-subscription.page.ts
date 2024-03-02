import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LINKS } from '../../../core/consts/app-route.const';
import { CommonService } from '../../../core/services/common.service';
import { LoadingSpinnerComponent } from '../../global/loading-spinner/loading-spinner.component';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-verify-email-subscription-page',
  templateUrl: './verify-email-subscription.page.html',
  imports: [
    GeneralLayoutComponent,
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
  ],
})
export class VerifyEmailSubscriptionPageComponent {
  isLoading!: boolean;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token != null) {
        this.isLoading = true;
        setTimeout(() => {
          this.form.controls['token'].setValue(token);
          this.submit();
        }, 3000);
      }
    });
  }

  form = new FormGroup({
    token: new FormControl('', [Validators.required]),
  });

  submit() {
    this.commonService
      .verifyEmailSubscription(this.form.value.token as string)
      .subscribe(_ => {
        this.router.navigateByUrl(LINKS.INDEX_PAGE.url.internal as string);
      });
  }
}
