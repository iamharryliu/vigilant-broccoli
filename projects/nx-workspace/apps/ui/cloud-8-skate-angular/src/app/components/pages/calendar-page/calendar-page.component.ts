import { Component, OnInit, inject } from '@angular/core';
import { CalendarSectionComponent } from '../../features/calendar-section/calendar-section.component';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  imports: [CalendarSectionComponent],
})
export class CalendarPageComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Calendar',
      description:
        'Cloud8Skate event calendar. Find upcoming skating events, meetups, and sessions in Toronto at The Bentway and College Park.',
      url: 'https://cloud8skate.com/calendar',
      keywords:
        'Toronto skating events, skating calendar Toronto, skating meetups, Cloud8 events',
    });
  }
}
