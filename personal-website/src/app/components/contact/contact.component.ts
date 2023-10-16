import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
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

  formData: { name: string; email: string; message: string } = {
    name: '',
    email: '',
    message: '',
  };

  submitForm() {}
}
