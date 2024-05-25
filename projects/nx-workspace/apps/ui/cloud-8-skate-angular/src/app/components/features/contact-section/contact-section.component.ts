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
  APP_NAME = APP_NAME.CLOUD_8_SKATE;
  LINKS = [LINKS.CLOUD_8_SKATE_IG];
}
