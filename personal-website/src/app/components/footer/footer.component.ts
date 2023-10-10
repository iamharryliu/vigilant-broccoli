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
      HEADER: 'FOOTER.CAREER.HEADER',
      LINKS: [
        {
          URL: 'FOOTER.CAREER.LINKEDIN.URL',
          TEXT: 'FOOTER.CAREER.LINKEDIN.TEXT',
        },
        {
          URL: 'FOOTER.CAREER.GITHUB.URL',
          TEXT: 'FOOTER.CAREER.GITHUB.TEXT',
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
      HEADER: 'FOOTER.INSTAGRAM.HEADER',
      LINKS: [
        {
          URL: 'FOOTER.INSTAGRAM.PERSONAL.URL',
          TEXT: 'FOOTER.INSTAGRAM.PERSONAL.TEXT',
        },
        {
          URL: 'FOOTER.INSTAGRAM.SECONDHAND_STORE.URL',
          TEXT: 'FOOTER.INSTAGRAM.SECONDHAND_STORE.TEXT',
        },
        {
          URL: 'FOOTER.INSTAGRAM.SKATE.URL',
          TEXT: 'FOOTER.INSTAGRAM.SKATE.TEXT',
        },
      ],
    },
  };
}
