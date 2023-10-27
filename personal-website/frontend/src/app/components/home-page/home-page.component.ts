import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContactModule } from '@components/contact/contact.module';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [CommonModule, TranslateModule, ContactModule, RouterModule],
})
export class HomePageComponent {
  LINKS = [
    {
      URL: 'LINKS.OTHER.LINKEDIN.URL',
      TEXT: 'LINKS.OTHER.LINKEDIN.TEXT',
    },
    {
      URL: 'LINKS.OTHER.GITHUB.URL',
      TEXT: 'LINKS.OTHER.GITHUB.TEXT',
    },
  ];
}
