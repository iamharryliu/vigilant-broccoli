import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [CommonModule, TranslateModule, FormsModule],
})
export class ContactPageComponent {
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
