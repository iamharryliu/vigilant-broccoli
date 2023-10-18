import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { MessageRequest } from '@models/app.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  constructor(private commonService: CommonService) {}

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
    this.commonService.sendMessage(this.formData).subscribe(() => {
      this.formData = {
        name: '',
        email: '',
        message: '',
      };
    });
  }
}
