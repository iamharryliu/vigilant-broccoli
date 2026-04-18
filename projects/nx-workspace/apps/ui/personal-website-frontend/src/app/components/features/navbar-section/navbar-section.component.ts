import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINKS } from '../../../core/consts/routes.const';

@Component({
  selector: 'app-navbar-section',
  templateUrl: './navbar-section.component.html',
  imports: [RouterModule],
})
export class NavbarSectionComponent {
  links = [LINKS.ABOUT_PAGE /*, LINKS.DOCS_MD */];
  isMobileNavOpen = false;
}
