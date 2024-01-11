import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GeneralLayoutComponent } from '@layouts/general/genreral-layout.component';
import { LINKS } from '@consts/app-route.const';
import { CardComponent, LinkComponent } from '@prettydamntired/my-lib';

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
