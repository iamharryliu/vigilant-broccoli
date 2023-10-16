import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContactModule } from '@app/components/contact/contact.module';

@Component({
  standalone: true,
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  imports: [TranslateModule, CommonModule, ContactModule, ContactModule],
})
export class AboutPageComponent {}
