import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_PATH, LINKS } from '@app/app-route.const';
import { LinkComponent } from '@app/components/global/link/link.component';
import { Link } from '@app/core/models/app.model';
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
    links: [LINKS.VIBECHECK_LITE, LINKS.ABOUT_PAGE, LINKS.CONTACT_PAGE],
  };
}
