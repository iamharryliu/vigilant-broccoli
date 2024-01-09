import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-contact-page',
  templateUrl: './contact.page.html',
  imports: [GeneralLayoutComponent],
})
export class ContactPageComponent {}
