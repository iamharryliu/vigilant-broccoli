import { Component } from '@angular/core';
import { EXTERNAL_LINKS } from '../../../core/consts/routes.const';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';
import { GeneralLayoutComponent } from '../../layouts/general-layout.component';
import { MarkdownPageComponent } from 'general-components';
import { CalendarSectionComponent } from '../../features/calendar-section/calendar-section.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home.page.html',
  imports: [
    GeneralLayoutComponent,
    ContactSectionComponent,
    MarkdownPageComponent,
    CalendarSectionComponent,
  ],
})
export class HomePageComponent {
  EXTERNAL_LINKS = EXTERNAL_LINKS;
  contentFilepath = 'assets/site-content/about.md';

  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }
}
