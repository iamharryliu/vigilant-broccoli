import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Event, RouterModule } from '@angular/router';
import { LinkComponent } from '../link/link.component';
import { Link, TextSize } from '../models';

@Component({
  standalone: true,
  selector: 'lib-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent implements OnInit {
  @Input() bgColor = '';
  @Input() links: Link[] = [];
  @Input() textSize?: TextSize;
  @Input() isLight = false;
  @Input() isBold = false;
  @Input() isFixedForBrowser = false;
  @Input() isFixedForMobile = false;
  private previousScrollTop = 0;
  private initialized = false;
  isMobileNavOpen = false;
  isFading = false;

  ngOnInit(): void {
    // Initialize after a short delay to avoid immediate fade on refresh
    this.previousScrollTop = window.scrollY;
    setTimeout(() => {
      this.initialized = true;
    }, 1000);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(_: Event): void {
    if (!this.initialized) {
      return;
    }

    const currentScroll = window.scrollY;
    if (currentScroll > this.previousScrollTop) {
      this.isFading = true;
      this.isMobileNavOpen = false;
    } else {
      this.isFading = false;
    }
    this.previousScrollTop = currentScroll;
  }

  collapseNavbar() {
    this.isMobileNavOpen = false;
  }

  toggleNavbar() {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }
}
