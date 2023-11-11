import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { MessageRequest } from '@models/app.model';
import { Subject, exhaustMap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LINKS } from '@app/app-route.const';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  submit$: Subject<boolean> = new Subject();

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

  LINKS = [
    LINKS.LINKEDIN,
    LINKS.PERSONAL_INSTAGRAM,
    LINKS.SECONDHAND_STORE_IG,
    LINKS.SKATE_IG,
  ];

  formData: MessageRequest = {
    name: '',
    email: '',
    message: '',
  };

  submitForm() {
    this.submit$.next(true);
  }
}
