import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LINKS } from '@app/app-route.const';
import { CardComponent } from '@app/components/card/card.component';
import { ButtonLinkComponent } from '@app/components/global/button-link/button-link.component';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';

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
  LINKS = [
    LINKS.PERSONAL_WEBSITE,
    LINKS.LINKEDIN,
    LINKS.GITHUB,
    LINKS.PERSONAL_INSTAGRAM,
    LINKS.SECONDHAND_STORE_IG,
    LINKS.SKATE_IG,
    LINKS.VIBECHECK_LITE,
  ];
}
