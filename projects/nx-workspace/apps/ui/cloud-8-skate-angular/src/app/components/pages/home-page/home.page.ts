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
  private readonly scrollOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'start',
  };
  private readonly sectionOrder = [
    'hero-section',
    'about-section',
    'calendar-section',
  ] as const;

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
    document.getElementById(section)?.scrollIntoView(this.scrollOptions);
  }

  scrollToNext(currentSectionId: string) {
    const currentSectionIndex = this.sectionOrder.indexOf(
      currentSectionId as (typeof this.sectionOrder)[number],
    );

    if (currentSectionIndex === -1) {
      return;
    }

    const nextSectionId = this.sectionOrder[currentSectionIndex + 1];

    if (!nextSectionId) {
      this.scrollToTop();
      return;
    }

    this.scrollTo(nextSectionId);
  }

  isLastSection(sectionId: string) {
    return this.sectionOrder[this.sectionOrder.length - 1] === sectionId;
  }

  getScrollButtonLabel(sectionId: string) {
    return this.isLastSection(sectionId)
      ? 'Scroll back to top'
      : 'Scroll to next section';
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
