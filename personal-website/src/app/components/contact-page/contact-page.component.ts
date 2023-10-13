import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

const DEFAULT_FORM_DATA = { name: '', email: '', message: '' };
@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [CommonModule, TranslateModule, FormsModule],
})
export class ContactPageComponent {
  LINKS = [
    {
      URL: 'LINKS.CAREER.LINKEDIN.URL',
      TEXT: 'LINKS.CAREER.LINKEDIN.TEXT',
    },
    {
      URL: 'LINKS.INSTAGRAM.PERSONAL.URL',
      TEXT: 'LINKS.INSTAGRAM.PERSONAL.TEXT',
    },
    {
      URL: 'LINKS.INSTAGRAM.SECONDHAND_STORE.URL',
      TEXT: 'LINKS.INSTAGRAM.SECONDHAND_STORE.TEXT',
    },
    {
      URL: 'LINKS.INSTAGRAM.SKATE.URL',
      TEXT: 'LINKS.INSTAGRAM.SKATE.TEXT',
    },
  ];

  formData: { name: string; email: string; message: string } =
    DEFAULT_FORM_DATA;

  submitForm() {}
}
