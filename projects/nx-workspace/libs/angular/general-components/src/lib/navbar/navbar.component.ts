import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Event, RouterModule } from '@angular/router';
import { LinkComponent } from '../link/link.component';
import { Link } from '../models';

@Component({
  standalone: true,
  selector: 'lib-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent implements OnInit {
  @Input() bgColor = 'bg-inherit';
  @Input() links: Link[] = [];
  @Input() textClasses?: string[];
  @Input() isBold = false;
  @Input() isStickyForBrowser = false;
  @Input() isFixedForBrowser = false;
  @Input() isFixedForMobile = false;
  private previousScrollTop = 0;
  private initialized = false;
  isMobileNavOpen = false;
  isFading = false;

  ngOnInit(): void {
    this.previousScrollTop = window.scrollY;
    setTimeout(() => {
      this.initialized = true;
    }, 1000);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(_: Event): void {
    if (!this.initialized || window.scrollY <= 0) {
      return;
    }

    if (window.scrollY > this.previousScrollTop) {
      this.isFading = true;
      this.isMobileNavOpen = false;
    } else {
      this.isFading = false;
    }
    this.previousScrollTop = window.scrollY;
  }

  collapseNavbar() {
    this.isMobileNavOpen = false;
  }

  toggleNavbar() {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }
}
