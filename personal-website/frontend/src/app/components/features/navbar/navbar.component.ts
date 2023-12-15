import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_PATH, LINKS } from '@consts/app-route.const';
import { LinkComponent } from '@components/global/link/link.component';
import { Link } from '@models/app.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, TranslateModule, RouterModule, LinkComponent],
})
export class NavbarComponent {
  NAVBAR: { index: string; links: Link[] } = {
    index: APP_PATH.INDEX,
    links: [LINKS.VIBECHECK_LITE_APP, LINKS.ABOUT_PAGE, LINKS.CONTACT_PAGE],
  };
}
