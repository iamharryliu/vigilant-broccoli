import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-calendar-section',
  templateUrl: './calendar-section.component.html',
  imports: [],
})
export class CalendarSectionComponent {
  iframeSrc: SafeResourceUrl = '';

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    const width = isPlatformBrowser(this.platformId) ? window.innerWidth : 1024;
    this.updateIframeMode(width);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateIframeMode((event.target as Window).innerWidth);
  }

  private updateIframeMode(width: number) {
    const baseUrl = 'https://calendar.google.com/calendar/embed';
    const params = new URLSearchParams({
      wkst: '1',
      ctz: 'America/Toronto',
      title: 'Cloud8 Skate Events',
      src: 'ZmU3OTU0MzJjMDlhYzNmMmE5ZDc4MDdkZGY1NjhkZGE3ZmZkY2I1YzNlZDdkZDA3OGNhNmE2OTNhNjVjNzdiN0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
      mode: width < 768 ? 'AGENDA' : 'MONTH',
    });

    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseUrl}?${params.toString()}`,
    );
  }
}
