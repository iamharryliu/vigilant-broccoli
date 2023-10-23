import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { MessageForm } from '@models/app.model';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { mergeMap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  constructor(
    private commonService: CommonService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) {}

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    message: new FormControl('', Validators.required),
  });

  LINKS = [
    {
      URL: 'LINKS.OTHER.LINKEDIN.URL',
      TEXT: 'LINKS.OTHER.LINKEDIN.TEXT',
    },
    {
      URL: 'LINKS.OTHER.PERSONAL_IG.URL',
      TEXT: 'LINKS.OTHER.PERSONAL_IG.TEXT',
    },
    {
      URL: 'LINKS.OTHER.SECONDHAND_STORE_IG.URL',
      TEXT: 'LINKS.OTHER.SECONDHAND_STORE_IG.TEXT',
    },
    {
      URL: 'LINKS.OTHER.SKATE_IG.URL',
      TEXT: 'LINKS.OTHER.SKATE_IG.TEXT',
    },
  ];

  formData: MessageForm = {
    name: '',
    email: '',
    message: '',
  };

  submitForm() {
    this.sendMessage().subscribe(() => {
      this.form.reset();
    });
  }

  sendMessage() {
    return this.recaptchaV3Service.execute('sendMessage').pipe(
      mergeMap(token =>
        this.commonService.sendMessage({
          ...(this.form.value as MessageForm),
          token: token,
        }),
      ),
    );
  }
}
