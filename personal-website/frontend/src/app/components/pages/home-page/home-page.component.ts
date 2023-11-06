import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContactModule } from '@app/components/features/contact/contact.module';
import { RouterModule } from '@angular/router';
import { CardComponent } from '@components/card/card.component';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [
    CommonModule,
    GeneralLayoutComponent,
    TranslateModule,
    ContactModule,
    RouterModule,
    CardComponent,
  ],
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
