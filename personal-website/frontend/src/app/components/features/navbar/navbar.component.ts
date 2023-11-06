import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_PATH } from '@app/app-route.const';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, TranslateModule, RouterModule],
})
export class NavbarComponent {
  NAVBAR = {
    INDEX: APP_PATH.INDEX,
    LINKS: [
      {
        URL: APP_PATH.VIBECHECK_LITE,
        TEXT: 'NAVBAR.VIBECHECK_LITE',
        IS_EXTERNAL_LINK: true,
        TARGET: '_blank',
      },
      {
        URL: APP_PATH.ABOUT,
        TEXT: 'NAVBAR.ABOUT',
        IS_EXTERNAL_LINK: false,
      },
      {
        URL: APP_PATH.CONTACT_PAGE,
        TEXT: 'NAVBAR.CONTACT',
        IS_EXTERNAL_LINK: false,
      },
    ],
  };
}
