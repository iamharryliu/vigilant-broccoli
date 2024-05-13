import { Component } from '@angular/core';
import { ContactComponent } from 'general-components';
import { LINKS } from '../../../core/consts/routes.const';
import { APP_NAME } from '@prettydamntired/personal-website-lib';

@Component({
  standalone: true,
  selector: 'app-contact-section',
  templateUrl: './contact-section.component.html',
  imports: [ContactComponent],
})
export class ContactSectionComponent {
  APP_NAME = APP_NAME.HARRYLIU_DESIGN;
  LINKS = [
    LINKS.LINKEDIN,
    LINKS.PERSONAL_INSTAGRAM,
    LINKS.SECONDHAND_STORE_IG,
    LINKS.SKATE_IG,
  ];
}
