import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-calendar-section',
  templateUrl: './calendar-section.component.html',
  imports: [MarkdownPageComponent],
})
export class CalendarSectionComponent {
  iframeSrc: SafeResourceUrl = '';
  contentFilepath = 'https://bucket.cloud8skate.com/content/calendar.md';

  constructor(private sanitizer: DomSanitizer) {
    this.updateIframeMode(window.innerWidth);
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
