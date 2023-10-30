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
  constructor(private commonService: CommonService) {}

  form = new FormGroup({
    email: new FormControl('', Validators.email),
  });

  submit() {
    this.commonService
      .subscribeToNewsletter(this.form.value as EmailSubscriptionRequest)
      .subscribe(() => {
        this.form.reset();
      });
  }
}
