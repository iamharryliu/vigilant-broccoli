import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  standalone: true,
  selector: 'app-calendar-section',
  templateUrl: './calendar-section.component.html',
  imports: [MarkdownPageComponent],
})
export class CalendarSectionComponent {
  contentFilepath = 'assets/site-content/calendar.md';
}
