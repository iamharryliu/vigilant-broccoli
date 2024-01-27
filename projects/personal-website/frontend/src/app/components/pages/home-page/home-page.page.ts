import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';
import { LINKS } from '@consts/app-route.const';
import { LinkComponent } from '@app/components/global/link/link.component';
import { CardComponent } from '@app/components/global/card/card.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home.page.html',
  imports: [
    CommonModule,
    GeneralLayoutComponent,
    RouterModule,
    CardComponent,
    LinkComponent,
  ],
})
export class HomePageComponent {
  LINKS = LINKS;
}
