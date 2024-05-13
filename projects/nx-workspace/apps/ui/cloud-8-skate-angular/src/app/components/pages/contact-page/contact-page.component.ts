import { Component } from '@angular/core';
import { ContactSectionComponent } from '../../contact-section/contact-section.component';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [ContactSectionComponent],
})
export class ContactPageComponent {}
