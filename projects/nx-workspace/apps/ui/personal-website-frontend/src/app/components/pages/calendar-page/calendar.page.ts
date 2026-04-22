import { Component, HostListener, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GeneralLayoutComponent } from '../../layouts/general/genreral-layout.component';
import {
  buildCalendarUrl,
  GOOGLE_CALENDAR,
  CalendarConfig,
} from '@vigilant-broccoli/common-browser';

const BASE_CALENDAR_CONFIG: Omit<CalendarConfig, 'mode'> = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  title: 'Calendar',
  ownerCalendars: [
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
    },
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
    },
  ],
  sharedCalendars: [
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
    },
  ],
};

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

const getModeForWidth = (width: number): CalendarConfig['mode'] => {
  if (width < MOBILE_BREAKPOINT) return 'AGENDA';
  if (width < TABLET_BREAKPOINT) return 'WEEK';
  return 'MONTH';
};

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar.page.html',
  imports: [GeneralLayoutComponent],
})
export class CalendarPageComponent implements OnInit {
  calendarUrl!: SafeResourceUrl;
  private currentMode: CalendarConfig['mode'] = 'MONTH';
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.updateCalendarUrl(window.innerWidth);
  }

  @HostListener('window:resize')
  onResize() {
    const mode = getModeForWidth(window.innerWidth);
    if (mode !== this.currentMode) {
      this.updateCalendarUrl(window.innerWidth);
    }
  }

  private updateCalendarUrl(width: number) {
    this.currentMode = getModeForWidth(width);
    this.calendarUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      buildCalendarUrl({ ...BASE_CALENDAR_CONFIG, mode: this.currentMode }),
    );
  }
}
