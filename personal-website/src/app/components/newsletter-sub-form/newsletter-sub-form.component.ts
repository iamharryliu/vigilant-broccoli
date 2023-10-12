import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from '../services/common.service';
import { CommonModule } from '@angular/common';
import { CredentialsInterceptorService } from '@app/core/credentials-interceptor.service';

@Component({
  standalone: true,
  selector: 'app-newsletter-sub-form',
  templateUrl: './newsletter-sub-form.component.html',
  imports: [CommonModule, TranslateModule, FormsModule, HttpClientModule],
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

  form = {
    email: '',
  };

  subscribe() {
    const email = this.form.email;
    this.commonService.subscribeToNewsletter(email).subscribe();
    // You can send the form data to a server for processing here
    // For example, you can use Angular's HttpClient to make an HTTP POST request to a server.

    // After successfully subscribing, you can reset the form
    this.form = {
      email: '',
    };
  }
}
