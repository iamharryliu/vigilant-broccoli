import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-calendar-section',
  templateUrl: './calendar-section.component.html',
  imports: [MarkdownPageComponent],
})
export class CalendarSectionComponent {
  contentFilepath = 'https://bucket.cloud8skate.com/content/calendar.md';
}
