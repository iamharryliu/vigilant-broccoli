import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { ContactComponent } from '../../features/contact/contact.component';
import { LINKS } from '../../../core/consts/routes.const';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact.page.html',
  imports: [GeneralLayoutComponent, ContactComponent],
})
export class ContactPageComponent {
  LINKS = LINKS;
}
