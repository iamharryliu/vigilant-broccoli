import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CardComponent } from '@components/global/card/card.component';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';
import { LinkComponent } from '@components/global/link/link.component';
import { LINKS } from '@app/app-route.const';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [
    CommonModule,
    GeneralLayoutComponent,
    TranslateModule,
    RouterModule,
    CardComponent,
    LinkComponent,
  ],
})
export class HomePageComponent {
  LINKS = LINKS;
}
