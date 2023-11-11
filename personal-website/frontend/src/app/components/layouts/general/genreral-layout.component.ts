import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ContactModule } from '@app/components/features/contact/contact.module';
import { FooterComponent } from '@app/components/features/footer/footer.component';
import { NavbarComponent } from '@app/components/features/navbar/navbar.component';
import { NewsLetterSubFormComponent } from '@app/components/features/newsletter-sub-form/newsletter-sub-form.component';
import { ReturnTopButtonComponent } from '@app/components/global/return-top-button/return-top-button.component';

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
    ContactModule,
  ],
})
export class GeneralLayoutComponent {
  @Input() hasContactForm = true;
  @Input() hasNewsLetterSignupForm = true;
}
