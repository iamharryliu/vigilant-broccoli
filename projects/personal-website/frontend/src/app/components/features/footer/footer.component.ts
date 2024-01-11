import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINKS } from '@consts/app-route.const';
import { LinkComponent } from '@prettydamntired/my-lib';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class FooterComponent {
  FOOTER = {
    SITE_MAP: {
      HEADER: 'FOOTER.SITE_MAP.HEADER',
      LINKS: [LINKS.ABOUT_PAGE, LINKS.CONTACT_PAGE, LINKS.PROJECTS_PAGE],
    },
    OTHER: {
      HEADER: 'LINKS.OTHER.HEADER',
      LINKS: [
        LINKS.LINK_TREE,
        LINKS.LINKEDIN,
        LINKS.RESUME,
        LINKS.GITHUB,
        LINKS.PERSONAL_INSTAGRAM,
        LINKS.SECONDHAND_STORE_IG,
        LINKS.SKATE_IG,
      ],
    },
  };
}
