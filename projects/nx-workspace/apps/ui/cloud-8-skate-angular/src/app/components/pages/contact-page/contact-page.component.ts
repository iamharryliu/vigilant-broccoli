import { Component } from '@angular/core';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [GeneralLayoutComponent, ContactSectionComponent],
})
export class ContactPageComponent {}
