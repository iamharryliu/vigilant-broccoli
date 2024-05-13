import { Component } from '@angular/core';
import { EXTERNAL_LINKS } from '../../../core/consts/routes.const';
import { ContactSectionComponent } from '../../contact-section/contact-section.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [ContactSectionComponent],
})
export class HomePageComponent {
  EXTERNAL_LINKS = EXTERNAL_LINKS;
}
