import { Component } from '@angular/core';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [ContactSectionComponent],
})
export class ContactPageComponent {}
