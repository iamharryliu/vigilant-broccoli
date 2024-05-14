import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINK_TYPE, NavbarComponent } from 'general-components';
import { LINKS } from '../../../core/consts/routes.const';

@Component({
  standalone: true,
  selector: 'app-navbar-section',
  templateUrl: './navbar-section.component.html',
  imports: [RouterModule, NavbarComponent],
})
export class NavbarSectionComponent {
  links = [
    { ...LINKS.HOME, type: LINK_TYPE.INTERNAL },
    { ...LINKS.CONTACT, type: LINK_TYPE.INTERNAL },
  ];
}
