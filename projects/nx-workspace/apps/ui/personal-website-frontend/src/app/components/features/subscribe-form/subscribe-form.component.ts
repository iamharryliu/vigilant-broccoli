import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, exhaustMap } from 'rxjs';
import { SubscribeRequest } from '@prettydamntired/personal-website-lib';
import { CommonService } from '../../../core/services/common.service';

@Component({
  standalone: true,
  selector: 'app-newsletter-sub-form',
  templateUrl: './subscribe-form.component.html',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
})
export class NewsLetterSubFormComponent {
  submit$ = new Subject<boolean>();

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
