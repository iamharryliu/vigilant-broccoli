import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LINKS } from '../../../core/consts/app-route.const';
import { CardComponent } from '../../global/card/card.component';
import { CenteredAppLayoutComponent } from '../../layouts/centered-app-layout/centered-app-layout.compoenent';
import { ButtonLinkComponent, Link } from 'general-components';

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
  styles: [
    '#profile-picture {width: 120px; height: 120px; border-radius: 50%;}',
  ],
})
export class LinkTreePageComponent {
  LINKS: Link[] = [
    { ...LINKS.INDEX_PAGE, text: 'Personal Website' },
    LINKS.LINKEDIN,
    LINKS.GITHUB,
    LINKS.RESUME,
    LINKS.PERSONAL_INSTAGRAM,
    LINKS.SECONDHAND_STORE_IG,
    LINKS.SKATE_IG,
  ];
}
