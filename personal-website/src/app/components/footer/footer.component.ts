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
    CAREER: {
      HEADER: 'LINKS.CAREER.HEADER',
      LINKS: [
        {
          URL: 'LINKS.CAREER.LINKEDIN.URL',
          TEXT: 'LINKS.CAREER.LINKEDIN.TEXT',
        },
        {
          URL: 'LINKS.CAREER.GITHUB.URL',
          TEXT: 'LINKS.CAREER.GITHUB.TEXT',
        },
      ],
    },
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
    INSTAGRAM: {
      HEADER: 'LINKS.INSTAGRAM.HEADER',
      LINKS: [
        {
          URL: 'LINKS.INSTAGRAM.PERSONAL.URL',
          TEXT: 'LINKS.INSTAGRAM.PERSONAL.TEXT',
        },
        {
          URL: 'LINKS.INSTAGRAM.SECONDHAND_STORE.URL',
          TEXT: 'LINKS.INSTAGRAM.SECONDHAND_STORE.TEXT',
        },
        {
          URL: 'LINKS.INSTAGRAM.SKATE.URL',
          TEXT: 'LINKS.INSTAGRAM.SKATE.TEXT',
        },
      ],
    },
  };
}
