import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { APP_PATH } from '@app/app-route.const';
import { AppRoutingModule } from '@app/app-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, TranslateModule, AppRoutingModule],
})
export class NavbarComponent {
  NAVBAR = {
    INDEX: APP_PATH.INDEX,
    LINKS: [
      {
        ROUTER_LINK: APP_PATH.STORE,
        TEXT: 'NAVBAR.SECONDHAND_STORE',
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
