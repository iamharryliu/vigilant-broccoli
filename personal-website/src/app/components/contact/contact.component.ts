import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { MessageForm } from '@models/app.model';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { EMPTY, mergeMap } from 'rxjs';

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

  formData: MessageForm = {
    name: '',
    email: '',
    message: '',
  };

  submitForm() {
    this.sendMessage().subscribe(() => {
      this.formData = {
        name: '',
        email: '',
        message: '',
      };
    });
  }

  sendMessage() {
    return this.recaptchaV3Service
      .execute('sendMessage')
      .pipe(
        mergeMap(token =>
          this.commonService.sendMessage({ ...this.formData, token: token }),
        ),
      );
  }
}
