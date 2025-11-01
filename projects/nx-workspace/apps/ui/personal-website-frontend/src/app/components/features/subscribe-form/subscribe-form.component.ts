import {} from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EMPTY, Subject, catchError, exhaustMap, finalize } from 'rxjs';
import { SubscribeRequest } from '@prettydamntired/personal-website-lib';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-newsletter-sub-form',
  templateUrl: './subscribe-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class NewsLetterSubFormComponent {
  submit$ = new Subject<boolean>();
  isLoading = false;
  private commonService= inject(CommonService);

  constructor() {
    this.submit$
      .pipe(
        exhaustMap(() =>
          this.commonService
            .subscribeToNewsletter(this.form.value as SubscribeRequest)
            .pipe(
              catchError(error => {
                console.error('An error occurred:', error);
                this.isLoading = false;
                return EMPTY;
              }),
              finalize(() => {
                this.isLoading = false;
                this.form.reset();
              }),
            ),
        ),
      )
      .subscribe();
  }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submit() {
    this.isLoading = true;
    this.submit$.next(true);
  }
}
