import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { LINKS } from '../../../core/consts/routes.const';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact.page.html',
  imports: [GeneralLayoutComponent, ContactSectionComponent],
})
export class ContactPageComponent {
  LINKS = LINKS;
}
