import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINKS } from '../../../core/consts/app-route.const';
import { Link } from '../../../core/models/app.model';
import { LinkComponent } from '../../global/link/link.component';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent {
  NAVBAR: { index: string; links: Link[] } = {
    index: LINKS.PERSONAL_WEBSITE.url.internal as string,
    links: [LINKS.PERSONAL_WEBSITE, LINKS.MD_LIBRARY, LINKS.ABOUT_PAGE],
  };
}
