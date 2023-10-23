import { Component } from '@angular/core';
import { ContactModule } from '@components/contact/contact.module';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [ContactModule],
})
export class ContactPageComponent {}
