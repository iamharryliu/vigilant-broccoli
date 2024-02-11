import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ContactComponent } from '../../features/contact/contact.component';
import { FooterComponent } from '../../features/footer/footer.component';
import { NavbarComponent } from '../../features/navbar/navbar.component';
import { NewsLetterSubFormComponent } from '../../features/subscribe-form/subscribe-form.component';
import { ReturnTopButtonComponent } from '../../global/return-top-button/return-top-button.component';

@Component({
  standalone: true,
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    NewsLetterSubFormComponent,
    ReturnTopButtonComponent,
    ContactComponent,
  ],
})
export class GeneralLayoutComponent {
  @Input() hasContactForm = true;
  @Input() hasSubscribeForm = true;
}
