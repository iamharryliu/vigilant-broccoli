import { Component } from '@angular/core';
import { FooterComponent } from '@app/components/features/footer/footer.component';
import { NavbarComponent } from '@app/components/features/navbar/navbar.component';
import { NewsLetterSubFormComponent } from '@app/components/features/newsletter-sub-form/newsletter-sub-form.component';
import { ReturnTopButtonComponent } from '@app/components/global/return-top-button/return-top-button.component';

@Component({
  standalone: true,
  selector: 'app-general-layout',
  templateUrl: './general-layout.component.html',
  imports: [
    NavbarComponent,
    FooterComponent,
    NewsLetterSubFormComponent,
    ReturnTopButtonComponent,
  ],
})
export class GeneralLayoutComponent {}
