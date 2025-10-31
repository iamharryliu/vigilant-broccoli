
import { Component } from '@angular/core';
import { LINKS } from '../../../core/consts/routes.const';
import { CenteredAppLayoutComponent } from '../../layouts/centered-app-layout/centered-app-layout.compoenent';
import { ButtonLinkComponent, Link } from 'general-components';

@Component({
  selector: 'app-link-tree-page',
  templateUrl: './link-tree.page.html',
  imports: [CenteredAppLayoutComponent, ButtonLinkComponent],
  styles: [
    '#profile-picture {width: 120px; height: 120px; border-radius: 50%;}',
  ],
})
export class LinkTreePageComponent {
  LINKS: Link[] = [
    LINKS.RESUME,
    LINKS.LINKEDIN,
    LINKS.GITHUB,
    { ...LINKS.INDEX_PAGE, text: 'Personal Website' },
    LINKS.SKATE_IG,
    // LINKS.PERSONAL_INSTAGRAM,
    // LINKS.SECONDHAND_STORE_IG,
    LINKS.KOFI,
  ];
}
