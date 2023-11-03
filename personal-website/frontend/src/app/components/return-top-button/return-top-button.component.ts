import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-return-top-button',
  templateUrl: './return-top-button.component.html',
  imports: [CommonModule],
})
export class ReturnTopButtonComponent {
  showScrollButton = false;

  @HostListener('window:scroll', [])
  onScroll() {
    this.showScrollButton = window.scrollY > 100; // Change 100 to the desired scroll position
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
