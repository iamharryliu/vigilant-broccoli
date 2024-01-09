import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINKS } from '@consts/app-route.const';
import { LinkComponent } from '@components/global/link/link.component';
import { Link } from '@models/app.model';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent {
  NAVBAR: { index: string; links: Link[] } = {
    index: LINKS.PERSONAL_WEBSITE.url.internal as string,
    links: [LINKS.PROJECTS_PAGE, LINKS.ABOUT_PAGE, LINKS.CONTACT_PAGE],
  };
}
