import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LINKS } from '@consts/app-route.const';
import { CardComponent } from '@components/global/card/card.component';
import { ButtonLinkComponent } from '@components/global/button-link/button-link.component';
import { CenteredAppLayoutComponent } from '@layouts/centered-app-layout/centered-app-layout.compoenent';

@Component({
  standalone: true,
  selector: 'app-link-tree-page',
  templateUrl: './link-tree.page.html',
  imports: [
    CenteredAppLayoutComponent,
    ButtonLinkComponent,
    CommonModule,
    CardComponent,
  ],
})
export class LinkTreePageComponent {
  LINKS = [LINKS.PERSONAL_INSTAGRAM, LINKS.SECONDHAND_STORE_IG, LINKS.SKATE_IG];
  CAREER_LINKS = [
    LINKS.LINKEDIN,
    LINKS.GITHUB,
    LINKS.PROJECTS_PAGE,
    LINKS.RESUME,
    LINKS.CONTACT_PAGE,
  ];
}
