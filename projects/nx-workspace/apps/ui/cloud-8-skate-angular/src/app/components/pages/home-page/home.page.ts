import { Component, OnInit, inject } from '@angular/core';
import { EXTERNAL_LINKS } from '../../../core/consts/routes.const';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';
import { MarkdownPageComponent } from 'general-components';
import { CalendarSectionComponent } from '../../features/calendar-section/calendar-section.component';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.page.html',
  imports: [
    ContactSectionComponent,
    MarkdownPageComponent,
    CalendarSectionComponent,
    RouterModule,
  ],
})
export class HomePageComponent implements OnInit {
  private seoService = inject(SeoService);

  EXTERNAL_LINKS = EXTERNAL_LINKS;
  contentFilepath = 'assets/site-content/about.md';

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Toronto Skating Community',
      description:
        'Cloud8 is a Toronto-based skating collective passionate about inline skating, rollerblading, rollerskating, and ice skating. Join us at The Bentway or College Park!',
      url: 'https://cloud8skate.com',
      keywords:
        'Toronto skating, inline skating Toronto, rollerblading Toronto, roller skating Toronto, ice skating Toronto, Cloud8, skating community, The Bentway, College Park skating',
    });
  }

  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToNext(event: Event) {
    const button = event.target as HTMLElement;
    const currentSection = button.closest('.section-container');
    const nextSection = currentSection?.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  }
}
