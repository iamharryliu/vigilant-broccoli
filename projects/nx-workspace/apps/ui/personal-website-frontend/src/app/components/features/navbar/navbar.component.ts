import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LINKS } from '../../../core/consts/app-route.const';
import { LinkComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent {
  LINKS = LINKS;
  isNavbarOpen = false;

  collapseNavbar() {
    this.isNavbarOpen = false;
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }
}
