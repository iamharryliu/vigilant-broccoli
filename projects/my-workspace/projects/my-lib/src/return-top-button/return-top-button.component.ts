import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  standalone: true,
  selector: 'lib-return-top-button',
  templateUrl: './return-top-button.component.html',
  imports: [CommonModule],
})
export class ReturnTopButtonComponent {
  showScrollButton = false;

  @HostListener('window:scroll', [])
  onScroll() {
    this.showScrollButton = window.scrollY > 100;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
