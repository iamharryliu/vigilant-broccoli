import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { MessageRequest } from '@models/app.model';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  constructor(
    private commonService: CommonService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) {}

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

  formData: MessageRequest = {
    name: '',
    email: '',
    message: '',
  };

  submitForm() {
    this.recaptchaV3Service
      .execute('sendMessage')
      .pipe(mergeMap(() => this.sendMessage()))
      .subscribe();
  }

  sendMessage() {
    return this.commonService.sendMessage(this.formData);
  }
}
