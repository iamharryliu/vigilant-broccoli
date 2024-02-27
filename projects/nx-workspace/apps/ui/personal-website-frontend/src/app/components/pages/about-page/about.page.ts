import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import { ContactComponent } from '../../features/contact/contact.component';
import { NewsLetterSubFormComponent } from '../../features/subscribe-form/subscribe-form.component';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about.page.html',
  imports: [
    CommonModule,
    GeneralLayoutComponent,
    ContactComponent,
    NewsLetterSubFormComponent,
  ],
})
export class AboutPageComponent {}
