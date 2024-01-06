// TODO: refactor links to open in new tab
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LINKS } from '@consts/app-route.const';
import { CardComponent } from '@components/global/card/card.component';
import { ButtonLinkComponent } from '@components/global/button-link/button-link.component';
import { CenteredAppLayoutComponent } from '@layouts/centered-app-layout/centered-app-layout.compoenent';

@Component({
  standalone: true,
  selector: 'app-link-tree-page',
  templateUrl: './link-tree-page.component.html',
  imports: [
    CenteredAppLayoutComponent,
    ButtonLinkComponent,
    CommonModule,
    CardComponent,
  ],
})
export class LinkTreePageComponent {
  CAREER_LINKS = [
    LINKS.SERVICES_PAGE,
    LINKS.LINKEDIN,
    LINKS.RESUME,
    LINKS.GITHUB,
  ];
  APP_LINKS = [
    LINKS.PERSONAL_WEBSITE,
    LINKS.VIBECHECK_LITE_APP,
    LINKS.REPEAT_TIMER,
  ];
  INSTAGRAM_LINKS = [
    LINKS.PERSONAL_INSTAGRAM,
    LINKS.SECONDHAND_STORE_IG,
    LINKS.SKATE_IG,
  ];
}
