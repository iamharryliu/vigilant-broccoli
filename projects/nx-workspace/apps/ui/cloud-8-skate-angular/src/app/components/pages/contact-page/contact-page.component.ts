import { Component, OnInit, inject } from '@angular/core';
import { ContactSectionComponent } from '../../features/contact-section/contact-section.component';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  imports: [ContactSectionComponent],
})
export class ContactPageComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Contact',
      description:
        'Get in touch with Cloud8Skate. Contact us for skating events, meetups, and general inquiries about our Toronto skating community.',
      url: 'https://cloud8skate.com/contact',
      keywords: 'contact Cloud8, Toronto skating contact, skating meetup Toronto',
    });
  }
}
