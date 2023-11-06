import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_PATH } from '@app/app-route.const';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [CommonModule, TranslateModule, RouterModule],
})
export class FooterComponent {
  FOOTER = {
    SITE_MAP: {
      HEADER: 'FOOTER.SITE_MAP.HEADER',
      LINKS: [
        {
          ROUTER_LINK: APP_PATH.ABOUT,
          TEXT: 'FOOTER.SITE_MAP.ABOUT',
        },
        {
          ROUTER_LINK: APP_PATH.CONTACT_PAGE,
          TEXT: 'FOOTER.SITE_MAP.CONTACT',
        },
        {
          ROUTER_LINK: APP_PATH.VIBECHECK_LITE,
          TEXT: 'FOOTER.SITE_MAP.VIBECHECK_LITE',
        },
      ],
    },
    OTHER: {
      HEADER: 'LINKS.OTHER.HEADER',
      LINKS: [
        {
          URL: 'LINKS.OTHER.LINKEDIN.URL',
          TEXT: 'LINKS.OTHER.LINKEDIN.TEXT',
        },
        {
          URL: 'LINKS.OTHER.GITHUB.URL',
          TEXT: 'LINKS.OTHER.GITHUB.TEXT',
        },
        {
          URL: 'LINKS.OTHER.PERSONAL_IG.URL',
          TEXT: 'LINKS.OTHER.PERSONAL_IG.TEXT',
        },
        {
          URL: 'LINKS.OTHER.SECONDHAND_STORE_IG.URL',
          TEXT: 'LINKS.OTHER.SECONDHAND_STORE_IG.TEXT',
        },
        {
          URL: 'LINKS.OTHER.SKATE_IG.URL',
          TEXT: 'LINKS.OTHER.SKATE_IG.TEXT',
        },
      ],
    },
  };
}
