import { Component } from '@angular/core';
import { CalendarSectionComponent } from '../../features/calendar-section/calendar-section.component';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';

@Component({
  standalone: true,
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  imports: [GeneralLayoutComponent, CalendarSectionComponent],
})
export class CalendarPageComponent {}
