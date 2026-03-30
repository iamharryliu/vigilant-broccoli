import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Input,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LinkComponent } from '../link/link.component';
import { Link } from '../models';

@Component({
  selector: 'lib-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterModule, LinkComponent],
})
export class NavbarComponent implements OnInit {
  @Input() bgColor = 'bg-inherit';
  @Input() links: Link[] = [];
  @Input() textClasses?: string[];
  @Input() activeClasses?: string[];
  @Input() isBold = false;
  @Input() isStickyForBrowser = false;
  @Input() isFixedForBrowser = false;
  @Input() isFixedForMobile = false;
  private platformId = inject(PLATFORM_ID);
  private previousScrollTop = 0;
  private initialized = false;
  isMobileNavOpen = false;
  isFading = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.previousScrollTop = window.scrollY;
      setTimeout(() => {
        this.initialized = true;
      }, 1000);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(_: globalThis.Event): void {
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
