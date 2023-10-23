import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { APP_PATH } from '@app/app-route.const';
import { AppRoutingModule } from '@app/app-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [CommonModule, TranslateModule, AppRoutingModule],
})
export class FooterComponent {
  FOOTER = {
    SITE_MAP: {
      HEADER: 'FOOTER.SITE_MAP.HEADER',
      LINKS: [
        {
          ROUTER_LINK: APP_PATH.STORE,
          TEXT: 'FOOTER.SITE_MAP.STORE',
        },
        {
          ROUTER_LINK: APP_PATH.ABOUT,
          TEXT: 'FOOTER.SITE_MAP.ABOUT',
        },
        {
          ROUTER_LINK: APP_PATH.CONTACT,
          TEXT: 'FOOTER.SITE_MAP.CONTACT',
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
