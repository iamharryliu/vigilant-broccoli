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
        ROUTER_LINK: APP_PATH.VIBECHECK_LITE,
        TEXT: 'NAVBAR.VIBECHECK_LITE',
      },
      {
        ROUTER_LINK: APP_PATH.ABOUT,
        TEXT: 'NAVBAR.ABOUT',
      },
      {
        ROUTER_LINK: APP_PATH.CONTACT,
        TEXT: 'NAVBAR.CONTACT',
      },
    ],
  };
}
