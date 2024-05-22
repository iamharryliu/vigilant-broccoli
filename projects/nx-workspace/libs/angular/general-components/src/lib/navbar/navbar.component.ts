import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LinkComponent } from '../link/link.component';
import { Link, TextSize } from '../models';

@Component({
  standalone: true,
  selector: 'lib-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent {
  @Input() links: Link[] = [];
  @Input() textSize?: TextSize;
  @Input() isLight = false;
  @Input() isBold = false;
  isNavbarOpen = false;

  collapseNavbar() {
    this.isNavbarOpen = false;
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }
}
