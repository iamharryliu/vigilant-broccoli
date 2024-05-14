import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LinkComponent } from '../link/link.component';

@Component({
  standalone: true,
  selector: 'lib-navbar',
  templateUrl: './navbar.component.html',
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent {
  // TODO: type this later
  @Input() links: any[] = [];
  isNavbarOpen = false;

  collapseNavbar() {
    this.isNavbarOpen = false;
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }
}
