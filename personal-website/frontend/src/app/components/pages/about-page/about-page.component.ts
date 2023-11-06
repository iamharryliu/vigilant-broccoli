import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContactModule } from '@app/components/features/contact/contact.module';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  imports: [
    TranslateModule,
    CommonModule,
    ContactModule,
    ContactModule,
    GeneralLayoutComponent,
  ],
})
export class AboutPageComponent {}
