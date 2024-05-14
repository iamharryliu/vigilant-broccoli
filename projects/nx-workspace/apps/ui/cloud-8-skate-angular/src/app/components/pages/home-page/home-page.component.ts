import { Component } from '@angular/core';
import { EXTERNAL_LINKS } from '../../../core/consts/routes.const';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [GeneralLayoutComponent, ContactSectionComponent],
})
export class HomePageComponent {
  EXTERNAL_LINKS = EXTERNAL_LINKS;
}
