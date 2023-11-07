import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINKS } from '@app/app-route.const';
import { LinkComponent } from '@app/components/global/link/link.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [CommonModule, TranslateModule, RouterModule, LinkComponent],
})
export class FooterComponent {
  FOOTER = {
    SITE_MAP: {
      HEADER: 'FOOTER.SITE_MAP.HEADER',
      LINKS: [LINKS.ABOUT_PAGE, LINKS.CONTACT_PAGE, LINKS.VIBECHECK_LITE],
    },
    OTHER: {
      HEADER: 'LINKS.OTHER.HEADER',
      LINKS: [
        LINKS.LINKEDIN,
        LINKS.GITHUB,
        LINKS.PERSONAL_INSTAGRAM,
        LINKS.SECONDHAND_STORE_IG,
        LINKS.SKATE_IG,
      ],
    },
  };
}
