import { Component } from '@angular/core';
import { MarkdownPageComponent } from 'general-components';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq.page.html',
  imports: [MarkdownPageComponent],
})
export class FaqPageComponent {
  contentFilepath = 'assets/site-content/faq.md';
}
