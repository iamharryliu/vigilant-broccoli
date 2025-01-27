import { Component } from '@angular/core';
import { NavbarComponent, LINK_TYPE } from 'general-components';
import { LINKS } from '../../../core/consts/routes.const';

@Component({
  standalone: true,
  selector: 'app-navbar-section',
  templateUrl: './navbar-section.component.html',
  imports: [NavbarComponent],
})
export class NavbarSectionComponent {
  links = [
    { ...LINKS.ABOUT_PAGE, type: LINK_TYPE.INTERNAL },
    { ...LINKS.DOCS_MD, type: LINK_TYPE.INTERNAL },
    { ...LINKS.PROJECTS_PAGE, type: LINK_TYPE.INTERNAL },
    // { ...LINKS.BLOGS, type: LINK_TYPE.INTERNAL },
  ];
}
