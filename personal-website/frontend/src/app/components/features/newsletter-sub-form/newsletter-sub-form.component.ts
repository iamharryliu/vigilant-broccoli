import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CredentialsInterceptorService } from '@services/credentials-interceptor.service';
import { CommonService } from '@services/common.service';
import { EmailSubscriptionRequest } from '@models/app.model';
import { Subject, exhaustMap } from 'rxjs';
import { ENVIRONMENT } from 'src/environments/environment';

@Component({
  standalone: true,
  selector: 'app-newsletter-sub-form',
  templateUrl: './newsletter-sub-form.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptorService,
      multi: true,
    },
  ],
})
export class NewsLetterSubFormComponent {
  submit$: Subject<boolean> = new Subject();

  constructor(private commonService: CommonService) {
    this.submit$
      .pipe(
        exhaustMap(() =>
          this.commonService.subscribeToNewsletter(
            this.form.value as EmailSubscriptionRequest,
          ),
        ),
      )
      .subscribe(res => {
        if (res.success) {
          window.open(
            `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/verify-email-subscription`,
            '_blank',
          );
        }
        this.form.reset();
      });
  }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submit() {
    this.submit$.next(true);
  }
}
