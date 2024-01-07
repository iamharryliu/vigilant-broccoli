import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@services/common.service';
import { SubscribeRequest } from '@models/app.model';
import { Subject, exhaustMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-newsletter-sub-form',
  templateUrl: './subscribe-form.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class NewsLetterSubFormComponent {
  submit$: Subject<boolean> = new Subject();

  constructor(private commonService: CommonService) {
    this.submit$
      .pipe(
        exhaustMap(() =>
          this.commonService.subscribeToNewsletter(
            this.form.value as SubscribeRequest,
          ),
        ),
      )
      .subscribe(_ => {
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
