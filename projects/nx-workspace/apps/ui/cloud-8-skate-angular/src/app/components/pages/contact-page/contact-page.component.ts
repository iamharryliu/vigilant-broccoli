import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MessageRequest } from '@prettydamntired/personal-website-lib';
import { Subject, exhaustMap } from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { LinkComponent } from 'general-components';
import { CommonModule } from '@angular/common';
import { LINKS } from '../../../core/consts/routes.const';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [CommonModule, ReactiveFormsModule, LinkComponent],
})
export class ContactPageComponent {
  submit$ = new Subject<boolean>();

  constructor(private commonService: CommonService) {
    this.submit$
      .pipe(
        exhaustMap(() =>
          this.commonService.sendMessage({
            ...(this.form.value as MessageRequest),
          }),
        ),
      )
      .subscribe(_ => {
        this.form.reset();
      });
  }

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', Validators.required),
  });

  submitForm() {
    this.submit$.next(true);
  }

  LINKS = [LINKS.CLOUD_8_SKATE_IG, LINKS.TORONTO_CITY_SKATE_IG];
}
