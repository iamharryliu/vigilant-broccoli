import { Component } from '@angular/core';
import { ContactModule } from '@app/components/features/contact/contact.module';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [ContactModule, GeneralLayoutComponent],
})
export class ContactPageComponent {}
