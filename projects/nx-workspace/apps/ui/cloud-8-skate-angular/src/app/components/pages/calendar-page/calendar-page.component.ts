import { Component } from '@angular/core';
import { CalendarSectionComponent } from '../../features/calendar-section/calendar-section.component';

@Component({
  standalone: true,
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  imports: [CalendarSectionComponent],
})
export class CalendarPageComponent {}
